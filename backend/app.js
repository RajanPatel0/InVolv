import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // Import passport configuration

const app = express();

app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//Importing Routes:
import vendorAuthRoutes from "./routes/vendorRoutes/authRoute.js";
import vendorProductRoute from "./routes/vendorRoutes/productRoute.js";
import vendorReservationRoute from "./routes/vendorRoutes/reservationRoute.js";
import analyticsRoute from "./routes/vendorRoutes/analyticsRoute.js";

import userAuthRoutes from "./routes/userRoutes/userAuthRoute.js";
import userInvolvRoutes from "./routes/userRoutes/intentRoute.js";
import involvNotificationRoute from "./routes/userRoutes/notificationRoute.js";
import searchRoute from "./routes/userRoutes/searchRoute.js";
import forecastRoute from "./routes/userRoutes/forecastRoute.js";

//just importing analytics job cron starts the cron
import "./utils/analyticsJob.js";

// Start metrics persistence job (Real-time analytics)
import { startMetricsPersistenceJob } from "./utils/metricsPersistenceJob.js";
startMetricsPersistenceJob(); 

//User Routes
app.use("/api/user", userAuthRoutes);
app.use("/api/userInvolv", userInvolvRoutes);
app.use("/api/userInvolv", involvNotificationRoute);

app.use("/api/search", searchRoute);
app.use("/api/user/forecast", forecastRoute);

//Vendor Routes
app.use("/api/vendor", vendorAuthRoutes);
app.use("/api/store", vendorProductRoute);
app.use("/api/vendor/reservations", vendorReservationRoute);
app.use("/api/vendor/analytics", analyticsRoute);


export default app