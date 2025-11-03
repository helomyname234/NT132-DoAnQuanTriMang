const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: "dd0ckmtsp",
    api_key: "169728499492996",
    api_secret: "GpJwVIS-1e4QASytTXMXgQwR1Zo"
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "blogify", // folder name on Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"],
        public_id: (req, file) => `${Date.now()}-${file.originalname}`
    }
});

module.exports = {
    cloudinary,
    storage
};
