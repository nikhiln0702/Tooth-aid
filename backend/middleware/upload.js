import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

console.log("hi")
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "toothaid",
		allowed_formats: ["jpg", "png", "jpeg"]
	}
});


console.log("Cloudinary storage configured:", storage);

const upload = multer({ storage });

console.log("Multer upload middleware configured");

export default upload;
