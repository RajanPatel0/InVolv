import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    vendorId: {     //it must be vendorId as same usage in controllers of product
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
    pdtName: {type: String, required: true, trim: true},
    pdtDesc: {type: String, required: true, trim: true},
    price: {type: Number, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    stock: {type: Number, required: true, trim: true},
    image: [{type: String, required: true}],
    createdAt: { type: Date, default: Date.now }
},{ timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;