import UserIntent from "../../models/UserModels/userIntentModel.js";
import Notification from "../../models/UserModels/notificationModel.js";
import Product from "../../models/StoreModels/productModel.js";
import Vendor from "../../models/StoreModels/vendorModel.js";
import { sendIntentCreatedNotification } from "../../utils/fcmService.js";

export const createIntent = async(req, res)=>{
    try{
        const userId= req.user._id;
        const { storeId, productId, intentType} = req.body;

        // Fetch product with vendor details
        const product = await Product.findById(productId).populate('vendorId', 'storeName');
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Fetch store details using storeId
        const store = await Vendor.findById(storeId);
        if(!store){
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Check if intent already exists
        const existingIntent = await UserIntent.findOne({
            userId,
            productId,
            storeId,
            intentType,
            status: "ACTIVE"
        });

        if (existingIntent) {
            return res.status(400).json({
                success: false,
                message: `You already have an active ${intentType} intent for this product`,
            });
        }

        const meta= {
            initialPrice: product.price,
            initialStock: product.stock,
        }
        let expiresAt = null;

        if (intentType === "RESERVE") {
            expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
        }

        const intent = await UserIntent.create({
            userId,
            storeId,
            productId,
            intentType,
            meta,
            expiresAt,
        });

        // Send FCM notification with product details
        try {
            const productName = product.pdtName || "Product";
            const storeName = store.storeName || "Store";
            await sendIntentCreatedNotification(
                userId,
                intentType,
                productName,
                storeName,
                storeId,
                productId
            );
        } catch (fcmError) {
            console.error("FCM notification error (non-blocking):", fcmError);
            // Don't fail the intent creation if FCM fails
        }

        res.status(201).json({
            success: true,
            message: "Intent saved successfully",
            intent,
        })
    } catch(err){
        console.log("Create Intent Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
};

export const cancelIntent = async(req, res)=>{
    try{
        const intent = await UserIntent.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!intent){
            return res.status(404).json({
                success: false,
                message: "Intent not found"
            });
        }

        res.json({
            success: true, 
            message: "Intent cancelled successfully"
        });
    } catch(err){
        console.error("Cancel Intent Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getMyIntents = async(req, res)=>{
    try {
        await UserIntent.deleteMany({
            intentType: "RESERVE",
            expiresAt: { $lte: new Date() },
            status: "ACTIVE",
        });

        const intents = await UserIntent.find({
            userId: req.user._id,
            status: "ACTIVE",
        }).populate("productId storeId");

        res.json({
            success: true,
            intents,
        });
    } catch (error) {
        console.error("Get My Intents Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}