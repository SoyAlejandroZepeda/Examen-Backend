const mongoose = require('mongoose');

const DepartmentSchema = mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company' 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

DepartmentSchema.index({ departmentName: 'text' });

module.exports = mongoose.model('Department', DepartmentSchema);