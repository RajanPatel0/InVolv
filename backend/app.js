import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

//Importing Routes:
import vendorAuthRoutes from "./routes/vendorRoutes/authRoute.js";

//using routes:
app.use("/api/vendor", vendorAuthRoutes);

export default app;