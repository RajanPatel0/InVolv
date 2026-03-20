import { verifyAccessToken, getUserFromToken } from "../../utils/Tokens/userTokens.js";

export const userAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies (like vendor uses)
    const token = req.cookies.accessToken;

    if (!token) {
      console.error(`[AUTH MIDDLEWARE] No accessToken found in cookies for ${req.path}`);
      return res.status(401).json({ 
        message: "Unauthorized: Token missing",
        requiredAt: req.path
      });
    }

    // Verify the token (checks signature + expiry)
    const decoded = verifyAccessToken(token);

    // Get user from decoded token's id
    const user = await getUserFromToken(token);

    if (!user) {
      console.error(`[AUTH MIDDLEWARE] User not found`);
      return res.status(401).json({ message: "User not found" });
    }
    
    // Token is valid → attach user to req object
    req.user = user;
    // Continue to protected route
    next();

  } catch (err) {
    console.error(`[AUTH MIDDLEWARE] Error:`, err.message);
    return res.status(401).json({ 
      message: "Unauthorized: " + err.message,
      error: err.message
    });
  }
};
