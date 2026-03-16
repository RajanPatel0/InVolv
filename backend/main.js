import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import "./config/firebase.js"; // Initialize Firebase Admin
import { startIntentMonitoring } from "./utils/intentMonitoringJob.js";

const PORT = process.env.PORT || 5000;

connectDB()
    .then(()=>{ //after connection port indication or error
        const server = app.listen(PORT, ()=>{
            console.log(`Server Is Running At: ${PORT}`);
            
            // Start intent monitoring job
            startIntentMonitoring(5 * 60 * 1000); // Run every 5 minutes
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
        });
    })
    .catch((err) =>{
        console.log(`Failed To Connect To MongoDB: ${err.message}`);
        process.exit(1);
    });