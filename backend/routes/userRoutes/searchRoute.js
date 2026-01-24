import express from "express";

import { searchProductNearby, getStoreDetailsWithAlternatives } from "../../controllers/userControllers/searchController.js";

const router = express.Router();

router.post("/product", searchProductNearby);
router.post("/store-details", getStoreDetailsWithAlternatives);

export default router;