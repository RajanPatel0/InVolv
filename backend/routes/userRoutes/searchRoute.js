import express from "express";

import { searchProductNearby } from "../../controllers/userControllers/searchController.js";

const router = express.Router();

router.post("/product", searchProductNearby);

export default router;