const mongoose = require('mongoose');

const CompanySchema = mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

CompanySchema.index({ companyName: 'text' });

module.exports = mongoose.model('Company', CompanySchema);