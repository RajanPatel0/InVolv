import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,  // Automatically sends and receives cookies
    headers: {
        "Content-Type": "application/json"
    },
});

// Variables for handling multiple simultaneous 401 errors
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh completes
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor for automatic token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const errorUrl = originalRequest?.url;
        const errorStatus = error.response?.status;

        // Only handle 401 errors that haven't been retried yet
        if (errorStatus === 401 && !originalRequest._retry) {
            // If refresh is already in progress, queue this request
            if (isRefreshing) {
                
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry original request after token refresh completes
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        console.error(`[INTERCEPTOR] Queued request failed:`, err.message);
                        return Promise.reject(err);
                    });
            }

            // Mark request as retry to prevent infinite retry loops
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token endpoint
                const refreshResponse = await axios.post(
                    "http://localhost:5000/api/user/refresh-token",
                    {},
                    {
                        withCredentials: true, // Send cookies (refreshToken)
                    }
                );

                if (refreshResponse.data?.success === false) {
                    console.error("[REFRESH] Response indicates failure:", refreshResponse.data?.message);
                    throw new Error(refreshResponse.data?.message || "Refresh token failed");
                }

                if (!refreshResponse.data?.success && refreshResponse.status === 200) {
                    console.error("[REFRESH] Status 200 but success is not true");
                    throw new Error("Refresh returned success=false");
                }

                console.log("[REFRESH] Access token refreshed successfully");
                // Process any queued requests
                processQueue(null, refreshResponse.data.accessToken);

                // Retry the original request (cookie with new token is already set)
                return api(originalRequest);

            } catch (refreshError) {
                // Token refresh failed - clear user data and redirect to login
                console.error("[REFRESH] Token refresh failed:", refreshError.message);
                console.error("[REFRESH] Error details:", refreshError);

                // Process queued requests with error
                processQueue(refreshError, null);

                // Clear local user data
                localStorage.removeItem("user");
                localStorage.removeItem("rememberedUser");

                // Show login page
                console.log("[LOGOUT] Redirecting to Login");
                window.location.href = "/userSignIn";

                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;