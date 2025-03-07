import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Withdraw Mode Schema
const TransferDetailsSchema = new Schema({
    UserID: { type: String, required: true, unique: true, ref: 'User' },
    account_holder_name: { type: String },
    account_number: { type: String },
    ifsc_code: { type: String },
    bic_swift_code: { type: String },
    branch: { type: String },
    bank_account_currency: { type: String },
    upi_address: { type: String },
  });
const  TransferDetails = mongoose.model('TransferDetails', TransferDetailsSchema);

export default TransferDetails ;
