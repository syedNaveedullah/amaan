import { connectDB, closeDB } from "../../config/mongodb.js";
import DepositRequest from "../../models/DepositRequest.js";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import fs from "fs";
import User from "../../models/User.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";

// Helper function to encrypt deposit request data
const encryptDepositReq = (depositData) => {
  const imageBase64 = depositData.image_proof.toString("base64"); // Convert buffer to Base64 string
  return {
    deposit_mode: depositData.deposit_mode ? encrypt(depositData.deposit_mode) : null,
    amount: depositData.amount ? encrypt(depositData.amount.toString()) : null, // Ensure amount is saved as a string
    image_proof: imageBase64 ? encrypt(imageBase64) : null, // Encrypt the Base64 string
    status: depositData.status ? depositData.status : null,
  };
};

const decryptDepositReq = (encryptedDepositData) => {
  return encryptedDepositData.map((data) => {
    const decryptedImageBase64 = decrypt(data.image_proof);
    return {
      deposit_mode: data.deposit_mode ? decrypt(data.deposit_mode) : null,
      amount: data.amount ? parseFloat(decrypt(data.amount)) : null,
      image_proof: data.image_proof ? decryptedImageBase64 : null, // Decrypted Base64 string
      status: data.status ? data.status : null,
    };
  });
};

const submitDepositRequest = async (req, res) => {
  try {
    // await connectDB();

    const AccountID = req.user.AccountID;
    const { deposit_mode, amount} = req.body;
    const image_proof = req.file.buffer; // Path to the uploaded file

    const status = "Pending";
    // Validate request body
    if ( !deposit_mode || !amount || !image_proof) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate deposit mode
    const validDepositModes = ["Bank", "UPI", "BTC", "Netteller", "ETH"];
    if (!validDepositModes.includes(deposit_mode)) {
      return res.status(400).json({ message: "Invalid deposit mode." });
    }
    const validDepositStatus = ['Pending', 'Approved', 'Rejected'];
    if(!validDepositStatus.includes(status)){
      return res.status(400).json({message: "Invalid Deposit Status."})
    }

    // Encrypt deposit request data
    const encryptedDepositReqData = encryptDepositReq({deposit_mode, amount, image_proof, status});

    // Create a new deposit request
    const newDepositRequest = new DepositRequest({
      AccountID,
      ...encryptedDepositReqData,
    });

    // console.log("submitted amount is",parseFloat(decrypt(encryptedDepositReqData.amount)));
    await newDepositRequest.save();

    return res.status(201).json({ message: "Deposit request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting deposit request:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    // await closeDB();
  }
};


// List all deposit requests for a given AccountID
const listDepositRequests = async (req, res) => {
  try {
    // await connectDB();

    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required." });
    }

    const depositData = await DepositRequest.find({ AccountID });

    // console.log(decrypt(depositData[0].image_proof));
    if (!depositData || depositData.length === 0) {
      return res.status(404).json({ message: "No deposit requests found." });
    }

    const decryptedDepositData = decryptDepositReq(depositData);

    res.status(200).json(decryptedDepositData);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    // await closeDB();
  }
};


const approvedDepositRequests = async (req, res) => {
  try {
    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required." });
    }

    const depositData = await DepositRequest.find({ AccountID, status: "Approved" });

    if (!depositData || depositData.length === 0) {
      return res.status(404).json({ message: "No deposit requests found." });
    }

    // Decrypt deposit data if necessary
    const decryptedDepositData = decryptDepositReq(depositData);

    // Calculate total investment amount
    const totalInvestment = decryptedDepositData.reduce((sum, deposit) => sum + deposit.amount, 0);

    // Send response with total investment included
    res.status(200).json({
      Investment: totalInvestment,
      deposits: decryptedDepositData,
    });
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export { submitDepositRequest, approvedDepositRequests, listDepositRequests };