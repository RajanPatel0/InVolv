import mongoose from "mongoose";

const userIntentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    storId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    intentType: {
        type: String,
        enum: ["RESERVE", "PRICE_DROP", "STOCK_CHANGE"],
        reuired: true,
    },

    meta: {
        initialPrice: { type: Number },
        initialStock: { type: Number },
    },

    status: {
        type: String,
        enum: ["ACTIVE", "TRIGGERED", "CANCELLED"],
        default: "ACTIVE",
    },
}, { timeStamp: true});

export default mongoose.model("UserIntent", userIntentSchema);