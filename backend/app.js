import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Importing Routes:
import vendorAuthRoutes from "./routes/vendorRoutes/authRoute.js";
import vendorProductRoute from "./routes/vendorRoutes/productRoute.js";

import userAuthRoutes from "./routes/userRoutes/userAuthRoute.js";
import searchRoute from "./routes/userRoutes/searchRoute.js"

app.use("/api/user", userAuthRoutes);

app.use("/api/search", searchRoute);

//Vendor Routes
app.use("/api/vendor", vendorAuthRoutes);
app.use("/api/store", vendorProductRoute);


export default app