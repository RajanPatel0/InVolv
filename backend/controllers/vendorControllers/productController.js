import fs from "fs";
import { handleUpload, handleDestroy } from "../../config/cloudinary.js";
import Product from "../../models/StoreModels/productModel.js";

export const addProduct = async(req, res)=>{
    try{
        const { pdtName, pdtDesc, price, category, stock } = req.body;
        const vendorId = req.vendor._id;

        if(!vendorId){
            return res.status(400).json({ message: "Vendor Id Not found for addition" });
        }

        if (!pdtName || typeof pdtName !== "string" || pdtName.trim() === "") {
            return res.status(400).json({ error: "Product name is required" });
        }

        if (!pdtDesc || typeof pdtDesc !== "string" || !pdtDesc.trim()) {
            return res.status(400).json({ message: "Product description is required" });
        }

        if (price === undefined || isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ error: "Price must be greater than 0" });
        }

        if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
        return res.status(400).json({ error: "Stock must be 0 or more" });
        }

        if (!category || typeof category !== "string" || category.trim() === "") {
        return res.status(400).json({ error: "Category is required" });
        }

        if (!req.files || req.files.length == 0) {    //if there's not any files uploaded on frontend then it asks for
            return res.status(400).json({ message: "Product image is required at least 1" });
        }

        const imageUrls = await Promise.all(        //if yes files is there then it make 
            req.files.map(file=>handleUpload(file.path))
        );

        req.files.forEach(file => {
            fs.unlinkSync(file.path);
        });

        const product = await Product.create({
            vendorId,
            pdtName: pdtName.trim(),
            pdtDesc: pdtDesc.trim(),
            price: Number(price),
            category: category.trim(),
            stock: Number(stock),
            image: imageUrls,
        })

        return res.status(201).json({ 
            success: true,
            message: "Product added successfully",
            product 
        });
    }catch(err){
        console.log("Error adding product", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateProduct = async(req, res)=>{
    try{
        const {pdtName, pdtDesc, price, category, stock, removeImages} = req.body;  //remove image extra button in update triggers from body as text of url of image to be deleted

        const productId=req.params.id;
        const vendorId= req.vendor._id; //get it from auth middleware from route

        const product = await Product.findOne({_id: productId, vendorId});  //params give id of pdt from db

        if(!product){
            return res.status(404).json({ message: "Product Not found or Unauthorized" })
        }

        if (pdtName) product.pdtName = pdtName.trim();  //text related updates 
        if (pdtDesc) product.pdtDesc = pdtDesc.trim();
        if (price !== undefined) product.price = Number(price);
        if (category) product.category = category.trim();
        if (stock !== undefined) product.stock = Number(stock);

        let imagesToRemove = [];    //if image removal in update
        if (removeImages) {
            imagesToRemove = Array.isArray(removeImages)    //if there's for removal then proceed 
                ? removeImages
                : JSON.parse(removeImages); //if not for removal then jsonly parse it

            for (const imgUrl of imagesToRemove) {
                const publicId = imgUrl.split("/").pop().split(".")[0];
                await handleDestroy(publicId);
            }

            product.image = product.image.filter(
                (img) => !imagesToRemove.includes(img)
            );
        }

        if(req.files && req.files.length>0){  //if new image upload handle
            const uploadedImage = await Promise.all(
                req.files.map(file => handleUpload(file.path))
            )
            req.files.forEach((file) => fs.unlinkSync(file.path));  //deleting local files used up by multer in processing

            product.image.push(...uploadedImage);   //pushing cuzz it's addition in existed array
        }       

        if( product.image.length === 0 || product.image.length > 5){  //base case check
            return res.status(400).json({
                success: false,
                message: product.image.length === 0 ? "At least 1 image is required" : "Maximum 5 images allowed per product"
            });
        }

        await product.save();
        
        res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
            product
        });
    }catch(err){ 
        console.log("Error Updating product", err);
        return res.status(500).json({
            success: false,
            message: "Error Updating Product"
        })
    }
};

export const deleteProduct = async(req, res)=>{
    try{
        const productId = req.params.id;    //predefine Prevent accidental mutation / misuse
        const vendorId= req.vendor._id;

        //Find product + verify ownership in 1 query
        const product = await Product.findOne({     //findOne() expects an OBJECT (filter) so single passing takes as string
            _id: productId,
            vendorId
        });

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product Not found or Unauthorized"
            });
        };

        for(const imgUrl of product.image){     //delete all images from cloudinary
            const publicId = imgUrl.split("/").pop().split(".")[0];
            try{
                await handleDestroy(publicId); //full path needed just like as in creation
            }catch(err){
                console.log("Error deleting image from Cloudinary", err);
            }
        }

        await Product.findByIdAndDelete(productId); //delete product from db

        return res.status(200).json({
            success: true,
            message: "Product Deleted Successfully"
        })
    }catch(err){
        console.log("Error Deleting product", err);
        return res.status(500).json({
            success: false,
            message: "Error Deleting Product"
        })
    }
}