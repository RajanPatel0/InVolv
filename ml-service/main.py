from fastapi import FastAPI, HTTPException
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
import pandas as pd
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
client = MongoClient(os.getenv("MONGO_URI"))

DB_NAME = os.getenv("DB_NAME", "InVolv")
db = client[DB_NAME]

@app.get("/")
def root():
    return {"message": "ML service running"}

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/forecast/{product_id}/{vendor_id}")
def forecast_price(product_id: str, vendor_id: str, days: int = 7):
    """
    Returns price forecast for next N days.
    Uses Exponential Smoothing — simpler and more reliable than ARIMA
    when we have fewer data points.
    """
    try:
        # Fetch last 30 days of price history
        since = datetime.utcnow() - timedelta(days=30)
        cursor = db["pricehistories"].find({
            "productId": ObjectId(product_id),
            "vendorId":  ObjectId(vendor_id),
            "recordedAt": {"$gte": since}
        }).sort("recordedAt", 1)

        records = list(cursor)

        if len(records) < 5:
            raise HTTPException(status_code=404, detail="Not enough price history")

        # Build daily price series — if multiple records per day, take last
        df = pd.DataFrame(records)
        df["date"] = pd.to_datetime(df["recordedAt"]).dt.date
        df = df.groupby("date")["price"].last().reset_index()
        df = df.sort_values("date")

        prices = df["price"].values.astype(float)

        # Exponential Smoothing forecast
        model = SimpleExpSmoothing(prices, initialization_method="estimated")
        fit = model.fit(optimized=True)
        forecast_values = fit.forecast(days)

        # Build response
        last_date = df["date"].max()
        forecast_dates = [
            (datetime.combine(last_date, datetime.min.time()) + timedelta(days=i+1)).strftime("%Y-%m-%d")
            for i in range(days)
        ]

        current_price = float(prices[-1])
        forecast_end  = float(forecast_values[-1])
        trend = "rising" if forecast_end > current_price * 1.02 else \
                "falling" if forecast_end < current_price * 0.98 else "stable"

        best_buy_day = int(np.argmin(forecast_values))  # index of cheapest predicted day

        return {
            "productId": product_id,
            "vendorId":  vendor_id,
            "currentPrice": current_price,
            "trend": trend,
            "bestBuyIn": best_buy_day + 1,  # days from now
            "forecast": [
                {"date": forecast_dates[i], "predictedPrice": round(float(forecast_values[i]), 2)}
                for i in range(days)
            ],
            "dataPoints": len(prices),
            "generatedAt": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))