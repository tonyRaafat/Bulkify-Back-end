import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    operation: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
