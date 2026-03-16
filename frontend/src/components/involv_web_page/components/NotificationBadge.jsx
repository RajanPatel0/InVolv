import React from "react";
import { motion } from "framer-motion";

const NotificationBadge = ({ count = 0, variant = "dot" }) => {
  if (count === 0 && variant === "dot") {
    return null;
  }

  if (variant === "count") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full"
      >
        {count > 99 ? "99+" : count}
      </motion.div>
    );
  }

  // Default: dot variant
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 w-3 h-3 bg-emerald-500 rounded-full"
    />
  );
};

export default NotificationBadge;
