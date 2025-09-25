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



const upload = multer({ storage });


export default upload;
