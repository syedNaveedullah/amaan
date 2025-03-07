import axios from "axios"

async function getData() {
  try {
    const res = await axios.get("https://v6.exchangerate-api.com/v6/909d6fd3c2d7350a05fca909/latest/USD");
    console.log("1 USD is equal to",res.data.conversion_rates.USD);
    console.log("this much inr now",res.data.conversion_rates.INR);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


getData();
