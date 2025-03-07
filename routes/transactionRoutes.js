import express from "express";
import { fetchExchangeRateController, createTransaction, verifyPayment, razorpayWebhook } from "../controllers/transactionControllers/transactionControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import isEmailVerified from "../middleware/isEmailVerified.js";

const router = express.Router();

// Fetch exchange rate for a given exchange name
router.get("/exchange-rate/:exchangeName", verifyToken, isEmailVerified, fetchExchangeRateController);

// Create a new transaction and Razorpay order
router.post("/create-transaction", verifyToken, isEmailVerified, createTransaction);

// Verify Razorpay payment and update transaction
router.post("/verify-payment", verifyToken, isEmailVerified, verifyPayment);

router.post("/webhook/razorpay", razorpayWebhook);

export default router;
