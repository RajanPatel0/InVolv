import api from "../axios.js";

export const registerVendor  = async(vendorData)=>{
    const response = await api.post("/vendor/register", vendorData);
    return response.data;
};

export const verifyVendorOtp = async (otp, otpToken) => {
  const res = await api.post(
    "/vendor/verify-Otp",
    { otp },
    {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    }
  );
  return res.data;
};

export const loginVendor = async(email, password)=>{
  const res = await api.post(
    "/vendor/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const getVendorProfile = async () => {
  const res = await api.get(
    "/vendor/profile",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const addProduct= async(formData)=>{
  const res=await api.post(
    "/store/addProduct",
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const getAllProducts = async()=>{
  const res= await api.get(
    "/store/products",
    {
      withCredentials: true,
    }
  )
  return res.data;
};

export const updateProduct = async (productId, formData) => {
  const res = await api.patch(
    `/store/updateProduct/${productId}`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const deleteProduct = async (productId) => {
  const res = await api.delete(
    `/store/deleteProduct/${productId}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

// ============================================================
// ANALYTICS APIS
// ============================================================

/**
 * 1. REAL-TIME DASHBOARD
 * GET /api/vendor/analytics/realtime
 * Shows: Today's live data (searches, clicks, intents) - Updated every 5 minutes
 */
export const getRealTimeMetrics = async () => {
  const res = await api.get(
    "/vendor/analytics/realtime",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * 2. COMPARISON ANALYTICS
 * GET /api/vendor/analytics/compare?period=day|week|month
 * Shows: Day-over-day, week-over-week, month-over-month growth %
 */
export const getComparisonMetrics = async (period = "week") => {
  const res = await api.get(
    `/vendor/analytics/compare?period=${period}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * 3. CONVERSION FUNNEL
 * GET /api/vendor/analytics/funnel?dateRange=today|week|month
 * Shows: Searches → Views → Reserves conversion at each step
 */
export const getConversionFunnel = async (dateRange = "week") => {
  const res = await api.get(
    `/vendor/analytics/funnel?dateRange=${dateRange}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Conversion Funnel - Hourly Breakdown
 * GET /api/vendor/analytics/funnel/hourly?dateRange=week
 */
export const getHourlyFunnel = async (dateRange = "week") => {
  const res = await api.get(
    `/vendor/analytics/funnel/hourly?dateRange=${dateRange}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Conversion Funnel - Product Level
 * GET /api/vendor/analytics/funnel/products?dateRange=week
 * See which products convert best
 */
export const getProductConversionFunnel = async (dateRange = "week") => {
  const res = await api.get(
    `/vendor/analytics/funnel/products?dateRange=${dateRange}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * 4. INVENTORY OPTIMIZATION
 * GET /api/vendor/analytics/inventory/recommendations
 * Shows: Products to restock (high demand, low stock)
 * Shows: Products to reduce (low demand, high stock)
 * Shows: Predicted stock-out dates
 */
export const getInventoryRecommendations = async () => {
  const res = await api.get(
    "/vendor/analytics/inventory/recommendations",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Inventory - Category Analysis
 * GET /api/vendor/analytics/inventory/category
 */
export const getCategoryInventoryAnalysis = async () => {
  const res = await api.get(
    "/vendor/analytics/inventory/category",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Inventory - Stock-out Predictions
 * GET /api/vendor/analytics/inventory/stockout-predictions
 */
export const getPredictStockOutDates = async () => {
  const res = await api.get(
    "/vendor/analytics/inventory/stockout-predictions",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

// ============================================================
// RESERVATION APIS
// ============================================================

/**
 * Get all reservations for vendor
 * GET /api/vendor/reservations
 */
export const getReservations = async () => {
  const res = await api.get(
    "/vendor/reservations",
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Approve a reservation
 * PATCH /api/vendor/reservations/:id/approve
 */
export const approveReservation = async (reservationId) => {
  const res = await api.patch(
    `/vendor/reservations/${reservationId}/approve`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};

/**
 * Reject a reservation
 * PATCH /api/vendor/reservations/:id/reject
 */
export const rejectReservation = async (reservationId, reason = "") => {
  const res = await api.patch(
    `/vendor/reservations/${reservationId}/reject`,
    { reason },
    {
      withCredentials: true,
    }
  );
  return res.data;
};