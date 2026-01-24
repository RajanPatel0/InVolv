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

export const getStoreDetailsWithAlternatives = async (req, res) => {
  try {
    const { storeName, lat, lng, productName } = req.body;

    // VALIDATION
    if (!storeName || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Store name and location are required"
      });
    }

    // GET MAIN STORE
    const mainStore = await Vendor.findOne({ storeName });
    if (!mainStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // GET PRODUCTS FROM MAIN STORE
    const storeProducts = await Product.find({ vendorId: mainStore._id });

    // GET NEARBY ALTERNATIVE STORES WITH SAME PRODUCT
    const nearbyStores = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          distanceField: "distance",
          maxDistance: 5000,
          spherical: true
        }
      },
      {
        $match: {
          _id: { $ne: mainStore._id }
        }
      },
      {
        $limit: 5
      }
    ]);

    // ENRICH NEARBY STORES WITH PRODUCTS
    const enrichedNearbyStores = await Promise.all(
      nearbyStores.map(async (store) => {
        const products = await Product.find({ vendorId: store._id });
        
        // Try to find matching product
        let matchingProduct = null;
        if (productName) {
          matchingProduct = products.find(p => 
            p.pdtName.toLowerCase().includes(productName.toLowerCase())
          );
        }
        // If no match, use first available product
        if (!matchingProduct && products.length > 0) {
          matchingProduct = products[0];
        }

        return {
          id: store._id.toString(),
          name: store.storeName,
          phone: store.phone,
          address: store.address,
          location: store.location,
          distance: store.distance,
          openingHours: "9 AM – 10 PM", // Default, can be added to vendor model
          product: matchingProduct ? {
            name: matchingProduct.pdtName,
            price: matchingProduct.price,
            stock: matchingProduct.stock,
            productCategory: matchingProduct.category,
          } : null
        };
      })
    );

    // RESPONSE
    res.status(200).json({
      success: true,
      data: {
        mainStore: {
          id: mainStore._id.toString(),
          name: mainStore.storeName,
          phone: mainStore.phone,
          address: mainStore.address,
          location: mainStore.location,
          category: mainStore.category,
          isOpen: true,
          products: storeProducts.map(p => ({
            id: p._id.toString(),
            name: p.pdtName,
            description: p.pdtDesc,
            price: p.price,
            stock: p.stock,
            category: p.category,
            image: p.image,
          }))
        },
        nearbyAlternatives: enrichedNearbyStores.filter(s => s.product !== null)
      }
    });

  } catch (err) {
    console.error("Store Details Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
