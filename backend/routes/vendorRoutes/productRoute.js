import express from "express";

import { addProduct, updateProduct, deleteProduct, getAllProduct, getProduct } from "../../controllers/vendorControllers/productController.js";
import { authMiddleware } from "../../middlewares/vendorMiddlewares/authMiddleware.js";
import { upload } from "../../middlewares/multer.js";

const router = express.Router();

router.post("/addProduct", authMiddleware, upload.array("images",5), addProduct);
router.get("/products", authMiddleware ,getAllProduct);
router.get("/product/:id", authMiddleware, getProduct);
router.patch("/updateProduct/:id", authMiddleware, upload.array("images", 5), updateProduct);
router.delete("/deleteProduct/:id", authMiddleware, deleteProduct);

export default router;