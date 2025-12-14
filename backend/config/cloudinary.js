import { v2 as cloudinary } from "cloudinary";

//need isconfigured function cuzz cloudinary has been called before env inject causing error in work flow not sequential
//cloudinary.config() is executed before dotenv has finished injecting env values in some cases (ESM edge case).
//Even though env exists later, Cloudinary already initialized without keys
//This guarantees Cloudinary reads env after dotenv has executed
let isConfigured = false;

const initCloudinary = () => {
  if (isConfigured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  isConfigured = true;
};

export const handleUpload = async (filePath) => {
  initCloudinary(); // ensures config BEFORE upload

  const res = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder: "InVolv/Products",
  });

  return res.secure_url;
};

export const handleDestroy = async (publicId) => {
  initCloudinary();

  return await cloudinary.uploader.destroy(
    `InVolv/Products/${publicId}`
  );
};

export default cloudinary;
