import Vendor from "../../models/StoreModels/vendorModel.js";

export const searchProductNearby = async(req, res)=>{
    try{
        const {productName, lat, lng, radius=5000}= req.body;

        if(!productName || !lat || !lng){
            return res.status(400).json({
                success: false,
                message: "Product Name or Location are required"
            });
        }

        const vendors= await Vendor.aggregate([ //aggregate pipeline
            {
                $geoNear: {     //find vendor, calc distance, use sphereIdx
                    near:{
                        type: "Point",
                        coordinates: [Number(lng), Number(lat)],
                    },
                    distanceField: "distance",
                    maxDistance: radius,
                    spherical: true
                }
            },
            {
                $lookup:{   //joins vendor->products
                    from: "products",
                    localField: "_id",
                    foreignField: "vendorId",
                    as: "products"
                }
            },
            {
                $unwind: "$products"    //filter, sort & give object(not nested loop)
            },
            {
                $match: {   //searching
                    "products.pdtName": {
                        $regex: productName,
                        $options: "i"
                    },
                    "products.stock": {
                        $gt: 0
                    }
                }
            },
            {
                $project: {     //response shaping
                    storeName: 1,
                    address: 1,
                    location: 1,
                    distance: 1,
                    product: {
                        name: "$products.pdtName",
                        price: "$products.price",
                        stock: "$products.stock"
                    }
                }
            },
            {
                $sort: { distance: 1 }  //nearest loc store first in res list
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Product Searched Successfully",
            count: vendors.length,
            data: vendors
        });
    }catch(err){
        console.log("Error In Searching Product", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
}