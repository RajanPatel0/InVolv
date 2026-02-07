import UserIntent from "../../models/UserModels/userIntentModel.js";
import Notification from "../../models/UserModels/notificationModel.js";
import Product from "../../models/StoreModels/productModel.js";

export const createIntent = async(req, res)=>{
    try{
        const userId= req.user._id;
        const { storeId, productId, intentType} = req.body;

        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                message: "Product not found"
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

        await Notification.create({ //for base case at starting on action button click 
            userId,
            title: "You're all set ✅",
            message: intentType === "PRICE_DROP"    //equality check if alreasdy exists
                ? "We’ll notify you when the price drops"
                : intentType === "STOCK_CHANGE"
                ? "We’ll notify you if stock changes"
                : "Product reserved successfully",  //this is for first time default
            link: `/store/${storeId}`,
        });

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

export const cancelIntent = async(req, res)=>{  //applicatble for all three intent types manual cancellation(deletion) of intent by user
    try{
        const intent = await UserIntent.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!intent){
            res.status(404).json({
                message: "Intent not found"
            });
        }
        //if exists, cancel it & save   -  no need this status updation as we are deleting the intent
        // intent.status= "CANCELLED";
        // await intent.save();

        res.json({success: true, message: "Intent cancelled successfully"});
    } catch(err){
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getMyIntents = async(req, res)=>{
    await UserIntent.deleteMany({   //no need for other intents as auto-expiry handling is only for RESERVE  those other's two are cancelled manually via above cancelIntent api
        intentType: "RESERVE",
        expiresAt: { $lte: new Date() },   //if expires at for any  reserve pdt is less than or equal to current date
    })

    const intents = await UserIntent.find({
        userId: req.user._id,   //only get therefore getting only userid via validation middleware(bearer token)
    }).populate("productId storeId");

    res.json({
        success: true,
        intents,
    });
}