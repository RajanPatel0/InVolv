import express from "express";
import { authMiddleware } from "../../middlewares/vendorMiddlewares/authMiddleware.js";
import { getReservations, approveReservation, rejectReservation } from "../../controllers/vendorControllers/reservationController.js";

const router = express.Router();

// Get all pending reservation for this vendor
router.get("/", authMiddleware, getReservations);

// PATCH /api/vendor/reservations/:intentId/approve: for approving pending reservations
router.patch("/:intentId/approve", authMiddleware, approveReservation);

// PATCH /api/vendor/reservations/:intentId/reject: for rejecting pending reservations with optional reason
router.patch("/:intentId/reject", authMiddleware, rejectReservation);

export default router;