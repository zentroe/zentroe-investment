import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Helper function to upload files
export const uploadFile = async (
  fileData: string,
  folder: string,
  options: {
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any[];
    publicId?: string;
  } = {}
) => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId,
      transformation: options.transformation,
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      }
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete files
export const deleteFile = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result
    };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to generate signed URLs for private files
export const generateSignedUrl = (publicId: string, options: any = {}) => {
  try {
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'jpg', {
      ...options
    });

    return {
      success: true,
      url: signedUrl
    };
  } catch (error: any) {
    console.error('Cloudinary signed URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;
