import Currency from '../../models/currency.js';


export const addCurrency = async (req, res) => {
  try {
    const { exchangeName, baseCurrency, fromCurrency, quoteCurrency, toCurrency, profit_percent } = req.body;

    // Check if currency pair already exists
    const existingRate = await Currency.findOne({ where: { exchangeName } });
    if (existingRate) {
      return res.status(400).json({ message: "Currency pair already exists" });
    }

    const newCurrency = await Currency.create({
      exchangeName,
      baseCurrency,
      fromCurrency,
      quoteCurrency,
      toCurrency,
      profit_percent,
    });

    return res.status(201).json({ message: "Currency rate added successfully", data: newCurrency });
  } catch (error) {
    console.error("Error adding currency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Get All Currency Rates
export const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll();
    return res.status(200).json({ data: currencies });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Get a Specific Currency Rate by Base & Quote Currency
export const getCurrencyByPair = async (req, res) => {
  try {
    const { exchangeName } = req.params;
    const currency = await Currency.findOne({ where: { exchangeName } });

    if (!currency) {
      return res.status(404).json({ message: "Currency pair not found" });
    }

    return res.status(200).json({ data: currency });
  } catch (error) {
    console.error("Error fetching currency pair:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ✅ Update Currency Rate (Admin)
export const updateCurrency = async (req, res) => {
  try {
    const { exchangeName } = req.params;
    const {  fromCurrency, toCurrency, profit_percent } = req.body;

    const updatedCurrency = await Currency.update(
      { exchangeName, fromCurrency, toCurrency, profit_percent },
      { where: { exchangeName } }
    );

    if (!updatedCurrency[0]) {
      return res.status(404).json({ message: "Currency pair not found or no changes made" });
    }

    return res.status(200).json({ message: "Currency rate updated successfully" });
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete Currency Rate (Admin)
export const deleteCurrency = async (req, res) => {
  try {
    const { exchangeName } = req.params;

    const deleted = await Currency.destroy({ where: { exchangeName } });

    if (!deleted) {
      return res.status(404).json({ message: "Currency pair not found" });
    }

    return res.status(200).json({ message: "Currency rate deleted successfully" });
  } catch (error) {
    console.error("Error deleting currency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
