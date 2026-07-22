const nodemailer = require('nodemailer');

// Create a reusable transporter using Gmail SMTP
// Credentials are loaded from environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,       // e.g. vyayadrishti.alerts@gmail.com
        pass: process.env.EMAIL_APP_PASSWORD // 16-char Gmail App Password
    }
});

/**
 * Sends a budget alert email notification.
 * @param {Object} options
 * @param {string} options.budgetName   - Name of the budget that triggered
 * @param {string} options.provider     - Cloud provider (AWS / Azure / GCP / all)
 * @param {number} options.threshold    - The percentage threshold crossed (80, 90, 100)
 * @param {string} options.severity     - 'warning' or 'critical'
 * @param {number} options.currentSpend - Current spend amount in USD
 * @param {number} options.budgetAmount - Total budget limit in USD
 * @param {string} options.recipientEmail - The email address to send the alert to
 */
const sendAlertEmail = async ({ budgetName, provider, threshold, severity, currentSpend, budgetAmount, recipientEmail }) => {
    // Skip if email credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.log('Email not configured — skipping notification');
        return;
    }

    const recipient = recipientEmail || process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER;
    const utilization = ((currentSpend / budgetAmount) * 100).toFixed(1);

    const severityColor = severity === 'critical' ? '#DC2626' : '#F59E0B';
    const severityLabel = severity === 'critical' ? 'CRITICAL' : 'WARNING';

    const mailOptions = {
        from: `"VyayaDrishti Alerts" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `[${severityLabel}] Budget "${budgetName}" crossed ${threshold}% threshold`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 28px 32px;">
                    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">VyayaDrishti</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Multi-Cloud Cost Monitoring</p>
                </div>

                <!-- Alert Badge -->
                <div style="padding: 28px 32px 0;">
                    <div style="display: inline-block; background: ${severityColor}20; border: 1px solid ${severityColor}40; border-radius: 8px; padding: 6px 14px;">
                        <span style="color: ${severityColor}; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">${severityLabel} ALERT</span>
                    </div>
                </div>

                <!-- Body -->
                <div style="padding: 20px 32px 28px;">
                    <p style="color: #F8FAFC; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                        Your budget <strong>"${budgetName}"</strong> for <strong>${provider === 'all' ? 'All Providers' : provider}</strong> has crossed the <strong>${threshold}%</strong> threshold.
                    </p>

                    <!-- Stats Grid -->
                    <div style="background: #1E293B; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #94A3B8; font-size: 13px;">Current Spend</td>
                                <td style="padding: 8px 0; color: #F8FAFC; font-size: 15px; font-weight: 700; text-align: right;">$${currentSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94A3B8; font-size: 13px; border-top: 1px solid #334155;">Budget Limit</td>
                                <td style="padding: 8px 0; color: #F8FAFC; font-size: 15px; font-weight: 700; text-align: right; border-top: 1px solid #334155;">$${budgetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94A3B8; font-size: 13px; border-top: 1px solid #334155;">Utilization</td>
                                <td style="padding: 8px 0; color: ${severityColor}; font-size: 15px; font-weight: 700; text-align: right; border-top: 1px solid #334155;">${utilization}%</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94A3B8; font-size: 13px; border-top: 1px solid #334155;">Provider</td>
                                <td style="padding: 8px 0; color: #F8FAFC; font-size: 15px; font-weight: 700; text-align: right; border-top: 1px solid #334155;">${provider === 'all' ? 'All Providers' : provider}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Utilization Bar -->
                    <div style="background: #334155; border-radius: 8px; height: 10px; overflow: hidden; margin-bottom: 20px;">
                        <div style="background: ${severityColor}; height: 100%; width: ${Math.min(utilization, 100)}%; border-radius: 8px;"></div>
                    </div>

                    <p style="color: #94A3B8; font-size: 13px; margin: 0;">
                        Log in to your VyayaDrishti dashboard to review your spending and take action.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #1E293B; padding: 16px 32px; border-top: 1px solid #334155;">
                    <p style="color: #64748B; font-size: 11px; margin: 0; text-align: center;">
                        This is an automated alert from VyayaDrishti Cloud FinOps Dashboard.
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId} — Budget "${budgetName}" ${severityLabel}`);
    } catch (error) {
        console.error('Failed to send alert email:', error.message);
        // Don't throw — email failure should not break the alert flow
    }
};

module.exports = { sendAlertEmail };
