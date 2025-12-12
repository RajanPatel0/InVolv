import cloudinary from "../../config/cloudinary.js";
import Product from "../../models/StoreModels/productModel";

export const addProduct = async(req, res)=>{
    try{
        const { pdtName, pdtDesc, price, category, stock } = req.body;
        const vendorId = req.user?.id || req.body.vendorId

        if(!vendorId){
            return res.status(400).json({ message: "Vendor Id Not found" });
        }

        const uploaded = image ? await cloudinary.uploader.upload(image, {
            folder: 'products'
        }) : null; 

        const product = await Product.create({
            vendor: vendorId,
            pdtName,
            pdtDesc,
            price,
            category,
            stock,
            image: uploaded ?.secure_url || "",
        })

        return res.status(201).json({ product });
    }catch(err){
        console.log("Error adding product", err);
        return res.status(500).json({
            success: false,
            message: "Error adding product"
        });
    }
}