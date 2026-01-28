import UserIntent from "../../models/UserModels/userIntentModel.js";
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

        const intent = await UserIntent.create({
            userId,
            storeId,
            productId,
            intentType,
            meta,
        })

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
        const intent = await UserIntent.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!intent){
            res.status(404).json({
                message: "Intent not found"
            });
        }
        //if exists, cancel it & save
        intent.status= "CANCELLED";
        await intent.save();

        res.json({success: true, message: "Intent cancelled successfully"});
    } catch(err){
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getMyIntents = async(req, res)=>{
    const intents = await UserIntent.find({
        userId: req.user._id,
    }).populaate("productId storeId");

    res.json({
        success: true,
        intents,
    });
}