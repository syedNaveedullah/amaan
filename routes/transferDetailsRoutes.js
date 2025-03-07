import express from "express";
import { submitTransferDetails, getTransferDetails } from "../controllers/transferDetails/transferDetailsController.js";
import isEmailVerified from "../middleware/isEmailVerified.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Route to submit or update transfer details
router.post("/submit", verifyToken, isEmailVerified, submitTransferDetails);

// Route to get transfer details
router.get("/", verifyToken ,isEmailVerified, getTransferDetails);

export default router;
