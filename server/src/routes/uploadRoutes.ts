import express, { Request, Response, RequestHandler } from 'express';
import { uploadFile } from '../config/cloudinary';

const router = express.Router();

// Upload endpoint for Vercel serverless functions
const uploadHandler: RequestHandler = async (req, res) => {
  try {
    console.log('Upload endpoint hit with body keys:', Object.keys(req.body));
    const { fileData, folder } = req.body;

    if (!fileData) {
      console.log('No file data provided');
      res.status(400).json({
        success: false,
        error: 'No file data provided'
      });
      return;
    }

    console.log('File data length:', fileData.length);
    console.log('File data starts with:', fileData.substring(0, 50));

    // Validate that it's a valid base64 image
    if (!fileData.startsWith('data:image/')) {
      console.log('Invalid file format detected');
      res.status(400).json({
        success: false,
        error: 'Invalid file format. Only images are allowed.'
      });
      return;
    }

    const uploadFolder = folder || 'zentroe/crypto-wallets';
    console.log('Uploading to folder:', uploadFolder);

    // Upload to Cloudinary
    const result = await uploadFile(fileData, uploadFolder, {
      resourceType: 'image'
    });

    console.log('Upload result:', result);

    if (!result.success) {
      console.log('Upload failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      });
      return;
    }

    console.log('Upload successful, secure_url:', result.data?.secure_url);
    res.json({
      success: true,
      data: result.data
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

router.post('/upload', uploadHandler);

export default router;
