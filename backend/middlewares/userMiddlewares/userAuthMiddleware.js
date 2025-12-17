import { verifyAccessToken, getUserFromToken } from "../../utils/Tokens/userTokens.js";

export const userAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // 2. Extract the token
    const token = authHeader.split(" ")[1];

    // 3. Verify the token (checks signature + expiry)
    const decoded = verifyAccessToken(token);

    // 4. Get user from decoded token's id
    const user = await getUserFromToken(token);

    // 5. Token is valid → attach user to req object
    req.user = user;

    // 6. Continue to protected route
    next();

  } catch (err) {
    return res.status(401).json({ 
      message: "Unauthorized: " + err.message 
    });
  }
};
