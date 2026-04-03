import { getPriceForecast } from "../../utils/forecastService.js";

export const getProductForecast = async (req, res) => {
  try {
    const { productId, vendorId } = req.params;
    const forecast = await getPriceForecast(productId, vendorId);
    res.json({ success: true, data: forecast });
  } catch (err) {
    // Don't crash if ML service is down — gracefully degrade
    if (err.code === "ECONNREFUSED" || err.response?.status === 404) {
      return res.json({ success: false, message: "Forecast not available yet", data: null });
    }
    res.status(500).json({ error: err.message });
  }
};