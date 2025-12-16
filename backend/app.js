import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Importing Routes:
import vendorAuthRoutes from "./routes/vendorRoutes/authRoute.js";
import vendorProductRoute from "./routes/vendorRoutes/productRoute.js"

//using routes:
app.use("/api/vendor", vendorAuthRoutes);

app.use("/api/store", vendorProductRoute);

export default app