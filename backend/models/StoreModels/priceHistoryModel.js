import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type:Number,
        required: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
},{ timeStamp: false });

priceHistorySchema.index({ productId: 1, vendorId: 1, recordedAt: 1});  //compound Index First sort by productId -> Then by vendorId -> Then by recordedAt (and 1 is used for ascending order low->high and -1 is used for descending order high->low)

export default mongoose.model("PriceHistory", priceHistorySchema);