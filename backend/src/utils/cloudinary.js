import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    console.log(process.env.CLOUDINARY_API_KEY);
    if (!localfilepath) {
      return null;
    }
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    // file has been uploaded succuessfully
    console.log("CLOUDINARY:", response);

    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    console.error("cloudinary", error);
    fs.unlinkSync(localfilepath); // remove the locally saved temporary files as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
