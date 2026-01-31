import UserIntent from "../../models/UserModels/userIntentModel.js";
import Notification from "../../models/UserModels/notificationModel.js";

const trigger = async(intent, message)=>{   //no export cuzz it's internal usage in above function only
    await Notification.create({ //so here notification got created only if something updated in product that matches user intent
        userId: intent.userId,
        title: "Good News! 🎉",
        message,
        link: `/store/${intent.storeId}`,
    });

    intent.status = "TRIGGERED";
    await intent.save();
}

export const processProductIntents = async(product)=>{
    console.log("Processing intents for product:", product._id);
    
    const intents = await UserIntent.find({
        productId: product._id,
        status: "ACTIVE",
    });

    console.log(`Found ${intents.length} ACTIVE intents for this product`);

    for(const intent of intents){
        // PRICE DROP: Check against last notified or initial price
        if(intent.intentType === "PRICE_DROP"){
            const previousPrice = intent.meta.lastNotifiedPrice !== undefined 
                ? intent.meta.lastNotifiedPrice 
                : intent.meta.initialPrice;
            
            console.log(`Price Check: Current ₹${product.price} vs Previous ₹${previousPrice}`);
            
            if(product.price < previousPrice){
                console.log(`PRICE DROP TRIGGERED: ₹${product.price} (was ₹${previousPrice})`);
                await trigger(intent, `Price dropped to ₹${product.price}`);
                
                // Update last notified price to prevent spam
                intent.meta.lastNotifiedPrice = product.price;
                await intent.save();
            }
        }

        // STOCK CHANGE: Check against last notified or initial stock
        if(intent.intentType === "STOCK_CHANGE"){
            const previousStock = intent.meta.lastNotifiedStock !== undefined 
                ? intent.meta.lastNotifiedStock 
                : intent.meta.initialStock;
            
            console.log(`Stock Check: Current ${product.stock} vs Previous ${previousStock}`);
            
            if(product.stock !== previousStock && product.stock > 0){
                console.log(`STOCK CHANGE TRIGGERED: ${product.stock} units (was ${previousStock})`);
                await trigger(intent, `Stock changed to ${product.stock} units`);
                
                // Update last notified stock
                intent.meta.lastNotifiedStock = product.stock;
                await intent.save();
            }
        }
    }
    
    console.log("✔️ Intent processing completed");
}
