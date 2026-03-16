import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    },
});

// Response interceptor to handle 401 errors - like after access token expires and calling any api gives 401 then instead of toast error we will directly logout the user and redirect to login page
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Clear auth data on 401
            localStorage.removeItem("accessToken");
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

            // Redirect to login
            window.location.href = "/userSignIn";
        }
        return Promise.reject(error);
    }
);

export default api;