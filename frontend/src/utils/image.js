export const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";
  
  // If img is already a full URL (Cloudinary URL)
  if (img.startsWith("http")) return img;
  
  // If img is a Cloudinary public_id or path
  if (img.startsWith("cloudinary://") || img.includes("cloudinary")) {
    // Extract the public_id and construct Cloudinary URL
    // This depends on how you store Cloudinary URLs
    return `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${img}`;
  }
  
  // If it's a relative path from your backend
  if (img.startsWith("/uploads/") || img.startsWith("/images/")) {
    return `${import.meta.env.VITE_API_BASE_URL}${img}`;
  }
  
  // Default fallback
  return "/placeholder.png";
};