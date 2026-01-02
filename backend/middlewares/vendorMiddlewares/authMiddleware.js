import { verifyAccessToken, getVendorFromToken } from "../../utils/Tokens/vendorTokens.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const decoded = verifyAccessToken(token);
    const vendor = await getVendorFromToken(token);

    if (!vendor) {
      return res.status(401).json({ message: "Vendor not found" });
    }

    req.vendor = vendor;
    next();

  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: " + err.message
    });
  }
};

