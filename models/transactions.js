// import mongoose from "mongoose";
// const Schema = mongoose.Schema;

// const transactionSchema = new Schema(
//     {
//         UserID: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },
//         transactionID: {
//             type: String,
//             required: true
//         },
//         transactionType: {
//             type: String,
//             enum: ["BUY", "SELL"], // Ensures only 'BUY' or 'SELL'
//             required: true,
//         },
//         paymentMethod: {
//             type: String,
//             enum: ["UPI", "Bank Transfer"],
//             required: true,
//         },
//         amountSent: {
//             type: Number,
//             required: true, //AMount that users gives
//         },
//         currencySent: {
//             type: String,
//             enum: ["USDT", "INR"], // Add more as needed
//             required: true,
//         },
//         amountRecieve: {
//             type: String,
//             required: true,
//         },
//         currencyRecieve:{
//             type: Number,
//             required: true, //AMount that user will recieve
//             enum: ["USDT", "INR"], // Add more as needed
//         },
//         fee: {
//             type: Number,
//             default: 0, // No fees by default
//         },
//         totalAmount: {
//             type: Number,
//             required: true,  //after caluclating the fees
//         },
//         payment_proof:{
//             type: String,
//             required: true
//         },
//         status: {
//             type: String,
//             enum: ["PENDING", "TRANSFER DONE", "FAILED"],
//             default: "PENDING",
//         },

//     },
//     { timestamps: true }
// );

// const Transaction = mongoose.model("Transaction", transactionSchema);

// export default Transaction;
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    UserID: { type: String, required: true, ref: 'User' },
    transactionID: { type: String, required: true, unique: true }, // Razorpay Order ID
    transactionType: { type: String, enum: ["BUY", "SELL"], required: true },
    paymentMethod: { type: String, enum: ["UPI", "Net Banking", "Card", "Bank Transfer"], required: true },
    amountSent: { type: Number, required: true }, // Amount that user sends
    currencySent: { type: String, required: true }, // Currency that user sends [INR,USDT]
    amountRecieve: { type: Number, required: true }, // Amount that user will receive
    currencyRecieve: { type: String, required: true }, // Currency that user will receive [INR,USDT]
    fee: { type: Number, default: 0 },  // Fees charged
    totalAmount: { type: Number, required: true },
    payment_proof: { type: String, default: "" }, // Razorpay Payment ID (if verified)
    status: { type: String, enum: ["PENDING", "PROCESSING", "TRANSFER DONE", "FAILED"], default: "PENDING" }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
