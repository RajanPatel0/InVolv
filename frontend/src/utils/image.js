export const getImageUrl = (img) => {
  // If no image provided
  if (!img) return "/placeholder.png";
  
  // If it's a data URL (base64), return as-is
  if (img.startsWith("data:image")) {
    return img;
  }
  
  // If img is an object with url property
  if (typeof img === 'object' && img.url) {
    img = img.url;
  }
  
  // If it's already a full URL
  if (img.startsWith("http")) return img;
  
  // Cloudinary public_id or path
  if (img.includes("cloudinary") || img.startsWith("image_")) {
    // You need to replace YOUR_CLOUD_NAME with your actual Cloudinary cloud name
    return `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${img}`;
  }
  
  // Local path from your backend
  if (img.startsWith("/uploads/") || img.startsWith("/images/")) {
    return `${import.meta.env.VITE_API_BASE_URL}${img}`;
  }
  
  // If it's a relative path without leading slash
  if (img.includes(".")) { // Has file extension like .jpg, .png
    return `${import.meta.env.VITE_API_BASE_URL}/${img}`;
  }
  
  // Default fallback
  return "/placeholder.png";
};