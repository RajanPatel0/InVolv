import express from "express";
import { getProductForecast } from "../../controllers/userControllers/forecastController.js";

const router = express.Router();

router.get("/:productId/forecast/:vendorId", getProductForecast);

export default router;
