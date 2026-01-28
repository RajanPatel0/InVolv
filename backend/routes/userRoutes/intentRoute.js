import express from "express";
import { createIntent, cancelIntent, getMyIntents} from "../../controllers/userControllers/intentController.js";
import { userAuthMiddleware} from "../../middlewares/userMiddlewares/userAuthMiddleware.js";

const router = express.Router();

//validtaion cuzz of userId used in controller
router.post("/create-intent", userAuthMiddleware, createIntent)
router.post("/cancel-intent/:id", userAuthMiddleware, cancelIntent);
router.get("/my-intents", userAuthMiddleware, getMyIntents);

export default router;