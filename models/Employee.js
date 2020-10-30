const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    surnameP: {
        type: String,
        required: true,
        trim: true
    },
    surnameM: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    birthdate: {
        type: Date,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    cellphone: {
        type: String,
        trim: true
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
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Department'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

EmployeeSchema.index({ name: 'text' });

module.exports = mongoose.model('Employee', EmployeeSchema);