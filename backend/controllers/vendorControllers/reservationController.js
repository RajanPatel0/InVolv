import UserIntent from "../../models/UserModels/userIntentModel.js";
import { sendFCMNotification } from "../../utils/fcmService.js";

// Get all pending reservation for this vendor
export const getReservations = async (req, res) => {
  try {
    const storeId = req.vendor._id;
    const { status = "ACTIVE", page = 1, limit = 10 } = req.query;

    const reservations = await UserIntent.find({
      storeId,
      intentType: "RESERVE",
      status,
    })
      .populate("userId", "name email phone")
      .populate("productId", "pdtName price stock image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserIntent.countDocuments({ storeId, intentType: "RESERVE", status });

    res.json({ success: true, data: reservations, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//for approving pending reservations
export const approveReservation = async (req, res) => {
  try {
    const reservation = await UserIntent.findOne({
      _id: req.params.intentId,
      storeId: req.vendor._id,
      intentType: "RESERVE",
    }).populate("userId").populate("productId");

    if (!reservation) return res.status(404).json({ error: "Reservation not found" });
    if (reservation.status !== "ACTIVE") return res.status(400).json({ error: "Already processed" });

    reservation.status = "APPROVED";
    await reservation.save();

    // Notify user via your existing FCM
    await sendFCMNotification(
      reservation.userId._id,{
        title: "Reservation Approved ✅",
        message: `Your reservation for ${reservation.productId.pdtName} has been approved!`,
        icon: "✅",
        link: "/myinvolv",
        notificationType: "RESERVATION_APPROVED",
        intentId: reservation._id,
        storeId: reservation.storeId,
        productId: reservation.productId._id,
    });

    res.json({ success: true, message: "Reservation approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//for rejecting pending reservations with optional reason
export const rejectReservation = async (req, res) => {
  try {
    const { reason } = req.body;
    const reservation = await UserIntent.findOne({
      _id: req.params.intentId,
      storeId: req.vendor._id,
      intentType: "RESERVE",
    }).populate("userId").populate("productId");

    if (!reservation) return res.status(404).json({ error: "Not found" });

    reservation.status = "REJECTED";
    reservation.rejectionReason = reason || "Vendor declined";
    await reservation.save();

    await sendFCMNotification(
      reservation.userId._id,{
        title: "Reservation Rejected ❌",
        message: `Your reservation for ${reservation.productId.pdtName} was declined. Reason: ${reservation.rejectionReason}`,
        icon: "❌",
        link: "/myinvolv",
        notificationType: "RESERVATION_REJECTED",
        intentId: reservation._id,
        storeId: reservation.storeId,
        productId: reservation.productId._id,
    });

    res.json({ success: true, message: "Reservation rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
