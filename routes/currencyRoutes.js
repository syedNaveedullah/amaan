import express from "express";
import {
  addCurrency,
  getAllCurrencies,
  getCurrencyByPair,
  updateCurrency,
  deleteCurrency,
} from "../controllers/currencyControllers/currencyControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import isEmailVerified from "../middleware/isEmailVerified.js";
import authorizeRoles from "../middleware/authorization.js";

const router = express.Router();

// Admin - Add Currency Rate
router.post("/", verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), addCurrency);

// Get All Currency Rates
router.get("/", verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), getAllCurrencies);

// Get Specific Currency Rate
router.get("/:exchangeName", verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), getCurrencyByPair);

// Admin - Update Currency Rate
router.put("/:exchangeName",verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), updateCurrency);

// Admin - Delete Currency Rate
router.delete("/:exchangeName",verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), deleteCurrency);

export default router;
