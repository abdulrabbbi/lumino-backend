import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { configDotenv } from 'dotenv'

configDotenv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return {
      folder: 'badges',
      public_id: file.fieldname + '-' + uniqueSuffix,   // optional
      resource_type: 'image', // keep this
      allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
      transformation: [{ width: 200, height: 200, crop: 'limit' }]
    }
  }
});

export { cloudinary, storage }  
