import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configuration for Cloudinary (Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env)
// If not explicitly configured here, Cloudinary tries to auto-configure from CLOUDINARY_URL in .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use memory storage (we'll stream the buffer to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Stream the buffer from memory directly to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'chattymind_media', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
        }
        
        // Return the secure URL to the frontend
        res.status(200).json({ mediaUrl: result.secure_url });
      }
    );

    // End the stream with the buffer
    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

export default router;
