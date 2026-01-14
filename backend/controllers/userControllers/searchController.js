import Vendor from "../../models/StoreModels/vendorModel.js";
import SearchLog from "../../models/StoreModels/searchLog.js";
import redis from "../../config/redis.js";
import Product from "../../models/StoreModels/productModel.js";

export const searchProductNearby = async (req, res) => {
  try {
    const { productName, lat, lng, radius = 5000 } = req.body;

    // VALIDATION
    if (!productName || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Product name and location are required"
      });
    }

    // CACHE CHECK
    const cacheKey = `search:${productName.toLowerCase()}:${lat}:${lng}:${radius}`;
    let cached = null;
    if (redis) {
      try {
        cached = await redis.get(cacheKey);
      } catch {}
      if (cached) {
        return res.status(200).json({
          success: true,
          source: "cache",
          count: JSON.parse(cached).length,
          data: JSON.parse(cached)
        });
      }
    }

    // GEO SEARCH — VENDORS
    const vendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          distanceField: "distance",
          maxDistance: radius,
          spherical: true
        }
      },
      {
        $project: {
          storeName: 1,
          address: 1,
          location: 1,
          distance: 1
        }
      }
    ]);

    if (!vendors.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const vendorIds = vendors.map(v => v._id);

    // ATLAS SEARCH — PRODUCTS (THIS IS WHERE $search GOES ✅)
    const products = await Product.aggregate([
      {
        $search: {
            index: "product_autocomplete",
            autocomplete: {
                query: productName,
                path: "pdtName",
                fuzzy: {
                    maxEdits: 1
                }
            }
        }
      },
      {
        $match: {
          vendorId: { $in: vendorIds },
          stock: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor"
        }
      },
      { $unwind: "$vendor" }
    ]);

    // MERGE DISTANCE
    const distanceMap = {};
    vendors.forEach(v => {
      distanceMap[v._id.toString()] = v.distance;
    });

    const finalResult = products
      .map(p => ({
        productImage: p.image,
        productName: p.pdtName,
        productCategory: p.category,
        price: p.price,
        stock: p.stock,
        storeName: p.vendor.storeName,
        phone: p.vendor.phone,
        address: p.vendor.address,
        location: p.vendor.location,
        distance: distanceMap[p.vendor._id.toString()]
      }))
      .sort((a, b) => a.distance - b.distance);

    // CACHE RESULT
    if (redis) {
      try {
        await redis.setex(cacheKey, 60, JSON.stringify(finalResult));
      } catch {}
    }


    // RESPONSE
    res.status(200).json({
      success: true,
      source: "db",
      count: finalResult.length,
      data: finalResult
    });

    // SEARCH LOG (NON-BLOCKING)
    SearchLog.create({
      productName,
      userLocation: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)]
      }
    }).catch(() => {});

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// 1. Validate input
// 2. Check Redis cache
// 3. GEO search vendors        (Vendor.aggregate)
// 4. Atlas search products     (Product.aggregate with $search)
// 5. Merge distance
// 6. Cache result
// 7. Send response
// 8. Save search log (async)
