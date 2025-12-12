import cloudinary from ("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleUpload = async(file)=>{
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    folder: "InVolv/Products",
  });
  return res.secure_url;
}

export default cloudinary;