//a mongoose schema defining the shape of every billing record of our database
//like a table definition in sql
const mongoose = require('mongoose');

const costRecordSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        enum: ['AWS', 'Azure', 'GCP']
    },
    service: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    date: {
        type: Date,
        required: true
    },
    usageQuantity: {
        type: Number,
        default: 0
    },
    tags: {
        project: { type: String, default: 'default' },
        team: { type: String, default: 'engineering' },
        environment: {
            type: String,
            enum: ['production', 'staging', 'development'],
            default: 'production'
        }
    }
}, {
    timestamps: true //creats createdAt and updatedAt field automatically
});
costRecordSchema.index({ provider: 1, date: -1 }); //index on provider and date for faster access
costRecordsSchema.index({ date: -1 });//
//export the model"costRecord" becomes collection name "costRecords"in mongoDB
module.exports = mongoose.model('CostRecord', costRecordSchema);