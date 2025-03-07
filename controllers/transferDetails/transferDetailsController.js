import TransferDetails from "../../models/transferDetails.js";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
// import { RESPONSE_MESSAGES } from "../../lib/constants.js";
// import Transaction from "../../models/transactions.js";

dotenv.config(); // Load environment variables

// Function to encrypt transaction data
const encryptTransferDetails = (transactionDetailsData) => {
  return {
    account_holder_name: transactionDetailsData.account_holder_name
      ? encrypt(transactionDetailsData.account_holder_name)
      : null,
    account_number: transactionDetailsData.account_number
      ? encrypt(transactionDetailsData.account_number)
      : null,
    ifsc_code: transactionDetailsData.ifsc_code
      ? encrypt(transactionDetailsData.ifsc_code)
      : null,
    bic_swift_code: transactionDetailsData.bic_swift_code
      ? encrypt(transactionDetailsData.bic_swift_code)
      : null,
    branch: transactionDetailsData.branch
      ? encrypt(transactionDetailsData.branch)
      : null,
    bank_account_currency: transactionDetailsData.bank_account_currency
      ? encrypt(transactionDetailsData.bank_account_currency)
      : null,
    upi_address: transactionDetailsData.upi_address
      ? encrypt(transactionDetailsData.upi_address)
      : null,
  };
};

// Function to decrypt transaction details
const decryptTransferDetails = (encryptedData) => {
  return {
    account_holder_name: encryptedData.account_holder_name
      ? decrypt(encryptedData.account_holder_name)
      : null,
    account_number: encryptedData.account_number
      ? decrypt(encryptedData.account_number)
      : null,
    ifsc_code: encryptedData.ifsc_code
      ? decrypt(encryptedData.ifsc_code)
      : null,
    bic_swift_code: encryptedData.bic_swift_code
      ? decrypt(encryptedData.bic_swift_code)
      : null,
    branch: encryptedData.branch ? decrypt(encryptedData.branch) : null,
    bank_account_currency: encryptedData.bank_account_currency
      ? decrypt(encryptedData.bank_account_currency)
      : null,
    upi_address: encryptedData.upi_address
      ? decrypt(encryptedData.upi_address)
      : null,
  };
};

// Submit Transfer Details
const submitTransferDetails = async (req, res) => {
  try {
    console.log(req.user)
    const UserID = req.user.UserID;
    const { transactionData } = req.body;
    
    console.log("UserID:", UserID);

    const encryptedData = encryptTransferDetails(transactionData);
    
    const findUser = await TransferDetails.findOne({ UserID });

    if (findUser) {
      const updateFields = {};
      for (const key in encryptedData) {
        if (encryptedData[key] !== null) {
          updateFields[key] = encryptedData[key];
        }
      }

      const updatedTransferDetails = await TransferDetails.findOneAndUpdate(
        { UserID },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedTransferDetails) {
        return res.status(404).json({ message: "Transfer details not found" });
      }

      return res.status(200).json({
        message: "Transfer details updated successfully",
        updatedTransferDetails,
      });
    } else {
      const newTransferDetails = new TransferDetails({ UserID, ...encryptedData });
      await newTransferDetails.save();

      return res.status(201).json({ message: "Transfer details submitted successfully" });
    }
  } catch (error) {
    console.error("Error submitting transfer details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Transfer Details
const getTransferDetails = async (req, res) => {
  try {
    const UserID = req.user.UserID;
    const transferDetailsData = await TransferDetails.findOne({ UserID });

    if (!transferDetailsData) {
      return res.status(404).json({ message: "No transfer details found" });
    }

    const decryptedTransferData = decryptTransferDetails(transferDetailsData.toObject());

    return res.status(200).json({
      message: "Transfer details fetched successfully",
      decryptedTransferData,
    });
  } catch (error) {
    console.error("Error fetching transfer details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { submitTransferDetails, getTransferDetails };