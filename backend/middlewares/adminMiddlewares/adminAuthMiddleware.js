// import jwt from "jsonwebtoken";
// import Admin from "../models/adminModel.js";

// export const adminAuthMiddleware = async (req, res, next) => {
//   try {
//     const token =
//       req.cookies?.adminToken ||
//       req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Admin authentication required",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const admin = await Admin.findById(decoded.id).select("-password");

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid admin token",
//       });
//     }

//     if (admin.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Admin access only",
//       });
//     }

//     req.admin = admin;
//     next();
//   } catch (error) {
//     console.error("Admin auth error:", error);
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized admin",
//     });
//   }
// };
