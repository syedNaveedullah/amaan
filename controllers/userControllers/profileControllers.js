import dotenv from "dotenv";
import { encryptUserData, decryptUserData } from "../../lib/EncryptDecrypt/UserData.js";
import User from "../../models/User.js";
import { openConnection, closeConnection } from "../../config/sqlconnection.js";
import { decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
dotenv.config(); // Load environment variables
import { RESPONSE_MESSAGES } from "../../lib/constants.js";

// Profile function
const Profile = async (req, res) => {
  try {
    // await openConnection();
    const id = req.user.userId; // Extract user ID from the request (e.g., from middleware)
    
    // Query the user while excluding sensitive fields
    const user = await User.findOne({
      where: { id: id },
      attributes: [
        "FullName",
        "Email",
        "Phone",
        "Account_Type",
        "Address",
        "AccountID",
        "ReferralID",
        "amount",
        "KYC_Status",
        "isEmailVerified",

      ],
    });

    // Check if a user was found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Decrypt user data
    const decryptedUserData = decryptUserData(user);
    decryptedUserData.AccountID = user.AccountID; // Ensure IDs remain unchanged
    decryptedUserData.ReferralID = user.ReferralID;
    decryptedUserData.KYC_Status = user.KYC_Status;
    decryptedUserData.isEmailVerified = Boolean(user.isEmailVerified);
    return res.json(decryptedUserData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error", error });
  } finally {
    // await closeConnection();
  }
};

// Update Profile function
const UpdateProfile = async (req, res) => {
  try {
    // await openConnection();
    const id = req.user.userId; // Ensure this comes from JWT middleware
    const updates = encryptUserData(req.body); // Encrypt incoming data

    if(updates.Email || updates.Phone){
      return res.status(400).json({message: "You are not allowed to update these fields."})
    }
    // console.log('Updating user with ID:', id);
    // console.log('Updates:', updates);
    // Dynamically construct the update object
    const updateFields = {};
    for (const key in updates) {
      if (updates[key] !== null) {
        updateFields[key] = updates[key];
      }
    }
    // Update the user's profile with the provided data
    const [affectedRows] = await User.update(updateFields, {
      where: { id },
      individualHooks: true, // Ensure hooks run if any (e.g., data validation or transformations)
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the updated user
    const updatedUser = await User.findOne({
      where: { id },
      attributes: ["FullName", "Account_Type", "Address"],
    });

    const decryptedUpdatedUserData = decryptUserData(updatedUser.toJSON());
    return res.json({ message: "Profile updated successfully", user: decryptedUpdatedUserData });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Server error", error });
  } finally {
    // await closeConnection();
  }
};

export { Profile, UpdateProfile };

