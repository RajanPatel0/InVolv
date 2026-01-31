import express from "express";
import { createIntent, cancelIntent, getMyIntents} from "../../controllers/userControllers/intentController.js";
import { userAuthMiddleware} from "../../middlewares/userMiddlewares/userAuthMiddleware.js";

const router = express.Router();

//validtaion cuzz of userId used in controller
router.post("/create", userAuthMiddleware, createIntent)
router.post("/cancel/:id", userAuthMiddleware, cancelIntent);
router.get("/intents", userAuthMiddleware, getMyIntents);

export default router;