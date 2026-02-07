import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const configureCloudinary = () => {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
};

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with secure_url
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'resumes',
        resource_type: 'raw', // For non-image files like PDFs
        type: 'private', // Private files - requires signed URLs
        use_filename: false,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  configureCloudinary();
  
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    invalidate: true,
  });
};

/**
 * Generate a secure signed URL for accessing private files
 * @param {string} publicId - The public ID of the file
 * @param {Object} options - URL generation options
 * @returns {string} - Signed secure URL
 */
export const getSecureUrl = (publicId, options = {}) => {
  configureCloudinary();
  
  // Generate URL without download attachment flag
  const url = cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'private',
    sign_url: true,
    secure: true,
    ...options,
  });
  
  return url;
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export default cloudinary;
