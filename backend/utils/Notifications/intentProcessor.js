import UserIntent from "../../models/UserModels/userIntentModel.js";
import Notification from "../../models/UserModels/notificationModel.js";

export const processProductIntents = async(product)=>{
    const intents = await UserIntent.find({
        productId: product._id,
        status: "ACTIVE",
    });

    for(const intent of intents){
        if(intent.intentType ==="PRICE_DROP" &&
            product.price< intent.meta.initialPrice
        ){
            await trigger(intent, "Price Dropped!");
        }

        if(intent.intentType ==="STOC_CHANGE" &&
            product.stock != intent.meta.initialStock
        ){
            await trigger(intent, "Stock Changed!");
        }
    }
}

const trigger = async(intent, message)=>{   //no export cuzz it's nor
    await Notification.create({
        userId: intent.userId,
        title: "Good News!",
        message,
        link: `/store/${intent.storeId}`,
    });

    intent.status = "TRIGGERED";
    await intent.save();
}