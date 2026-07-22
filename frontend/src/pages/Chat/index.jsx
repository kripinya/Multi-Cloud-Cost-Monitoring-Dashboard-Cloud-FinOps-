import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingDown, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STARTER_PROMPTS = [
    { icon: TrendingDown, label: 'Top cost drivers', prompt: 'What are my top 3 cost drivers across all clouds and how can I reduce them?' },
    { icon: AlertTriangle, label: 'Find waste', prompt: 'Identify potential wasted or idle resources across AWS, Azure, and GCP' },
    { icon: DollarSign, label: 'Monthly comparison', prompt: 'Compare my current month spending to last month and highlight the biggest changes' },
    { icon: BarChart3, label: 'Optimize architecture', prompt: 'Suggest architectural changes to reduce my cloud bill by 20%' },
];

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m **VyayaDrishti AI**. Ask me anything about your cloud costs — I can help you find savings and optimize spending across **AWS**, **Azure**, and **GCP**.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userMessage = (text || input).trim();
        if (!userMessage || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const mlApiUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:5001/api/ml';
            const response = await fetch(`${mlApiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.error }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t connect to the AI service. Please make sure the ML service is running on port 5001.' }]);
        }

        setLoading(false);
    };

    const showStarters = messages.length <= 1 && !loading;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                    <Bot size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-textMain">AI Cost Assistant</h2>
                    <p className="text-xs text-textMuted">Powered by Google Gemini</p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-5 mb-4 pr-2 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                            msg.role === 'user'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gradient-to-br from-primary to-blue-600 text-white'
                        }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        {/* Message Bubble */}
                        <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-primary text-white rounded-tr-md'
                                : 'bg-surface text-textMain rounded-tl-md border border-borderMain shadow-sm'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <div className="chat-markdown">
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mt-2 mb-2">{children}</ol>,
                                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mt-2 mb-2">{children}</ul>,
                                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                                            code: ({ children }) => <code className="bg-surfaceHover text-primary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}

                {/* Starter Prompts — shown only when conversation is fresh */}
                {showStarters && (
                    <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto mt-4">
                        {STARTER_PROMPTS.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(item.prompt)}
                                className="flex items-start gap-3 p-4 bg-surface border border-borderMain rounded-xl text-left hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group"
                            >
                                <item.icon size={18} className="text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <div>
                                    <div className="text-sm font-medium text-textMain">{item.label}</div>
                                    <div className="text-xs text-textMuted mt-0.5 line-clamp-2">{item.prompt}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Typing Indicator */}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 mt-1">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-surface text-textMuted p-4 rounded-2xl rounded-tl-md text-sm border border-borderMain shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="flex gap-3 bg-surface p-3 rounded-2xl border border-borderMain shadow-sm">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about your cloud costs..."
                    className="flex-1 px-3 py-2 bg-transparent text-sm text-textMain placeholder:text-textMuted focus:outline-none"
                />
                <button
                    onClick={() => sendMessage()}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                    <Send size={16} />
                    Send
                </button>
            </div>
        </div>
    );
}
