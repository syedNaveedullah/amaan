import Currency from "../../models/currency.js"; // Sequelize Model
import Transaction from "../../models/transactions.js"; // Mongoose Model
import Razorpay from "razorpay";
import crypto from 'crypto';
// import TransferDetails from "../../models/transferDetails.js";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Fetch Exchange Rate Controller
 */
export const fetchExchangeRateController = async (req, res) => {
    try {
        const { exchangeName } = req.params;

        // Fetch exchange details from the database
        const exchange = await Currency.findOne({ where: { exchangeName } });

        if (!exchange) {
            return res.status(404).json({ success: false, message: "Exchange not found" });
        }

        res.json({
            success: true,
            exchangeRate: exchange.toCurrency / exchange.fromCurrency,
            baseCurrency: exchange.baseCurrency,
            quoteCurrency: exchange.quoteCurrency,
        });
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Create Transaction & Razorpay Order
 */
export const createTransaction = async (req, res) => {
    console.log("req body ====", req.user);
    try {
        // const UserID  = req.user.UserID;
        const UserID  = req.user.userId;
        const { exchangeName, amountSent, amountRecieve,
            currencySent, currencyRecieve, paymentMethod } = req.body;

        // const findUser = await TransferDetails.findOne({ UserID });
        // if(!findUser){
        //     return res.status(403).json({success: false, message: "Submit your transfer details"})
        // }

        // Fetch exchange rate
        // const exchange = await Currency.findOne({ where: { exchangeName } });
        // if (!exchange) {
        //     return res.status(404).json({ success: false, message: "Exchange not found" });
        // }

        // const exchangeRate = exchange.toCurrency / exchange.fromCurrency;
        // const amountRecieve = amountSent * exchangeRate;

        // Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountSent * 100, // Convert to paisa for INR transactions
            currency: currencySent,
            receipt: `txn_${Date.now()}`,
            payment_capture: 1,
        });

        // Save transaction in MongoDB
        const transaction = await Transaction.create({
            UserID,
            transactionID: razorpayOrder.id, // Razorpay Order ID
            transactionType: currencySent === "INR" ? "BUY" : "SELL",
            paymentMethod,
            amountSent,
            currencySent,
            amountRecieve,
            currencyRecieve,
            fee: 0, // Set fee logic if applicable
            totalAmount: amountRecieve,
            payment_proof: "",
            status: "PENDING",
        });

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction,
            razorpayOrder, // Send this to frontend for payment processing
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Verify Payment & Update Transaction Status
 */
export const verifyPayment = async (req, res) => {
    try {
        const { transactionID, razorpay_payment_id, razorpay_signature } = req.body;

        // Find transaction by transactionID
        const transaction = await Transaction.findOne({ transactionID });

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        // Verify Razorpay signature (for extra security)
        const body = transactionID + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
        }

        // Update transaction status
        transaction.status = "TRANSFER DONE";
        transaction.payment_proof = razorpay_payment_id;
        await transaction.save();

        res.json({ success: true, message: "Payment verified successfully", transaction });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

/**
 * Razorpay Webhook to Handle Payment Events
 */
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // Set in Razorpay dashboard

        // Get Razorpay signature from headers
        const razorpaySignature = req.headers["x-razorpay-signature"];
        const body = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const { event, payload } = req.body;

        if (event === "payment.captured") {
            const razorpay_payment_id = payload.payment.entity.id;
            const razorpay_order_id = payload.payment.entity.order_id;

            // Find transaction using Razorpay Order ID
            const transaction = await Transaction.findOne({ transactionID: razorpay_order_id });

            if (!transaction) {
                return res.status(404).json({ success: false, message: "Transaction not found" });
            }

            // Update transaction status
            transaction.status = "TRANSFER DONE";
            transaction.payment_proof = razorpay_payment_id;
            await transaction.save();

            res.json({ success: true, message: "Transaction updated successfully", transaction });
        } else {
            res.json({ success: true, message: "Event received but not relevant" });
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
};
