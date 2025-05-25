/**
 * Cloudinary utility functions for image upload and management
 */

// Cloudinary configuration - make sure these values match your Cloudinary account settings
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dpkfvbpet';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '28chocomart_products'; // Use 'ml_default' as fallback or set your own unsigned upload preset

/**
 * Uploads an image to Cloudinary using the unsigned upload method
 * This is secure for client-side uploads as it doesn't expose the API secret
 * 
 * @param file The image file to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the Cloudinary response
 */
export const uploadImageToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Create XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    
    // Setup progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }
    
    // Handle response
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Cloudinary response:', response);
          
          if (response.secure_url && response.public_id) {
            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id
            });
          } else {
            console.error('Cloudinary response missing required fields:', response);
            reject(new Error('Invalid response from Cloudinary'));
          }
        } catch (error) {
          console.error('Failed to parse Cloudinary response:', error);
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          console.error('Cloudinary upload failed:', errorResponse);
          reject(new Error(`Upload failed: ${errorResponse.error?.message || 'Unknown error'}`));
        } catch (error) {
          console.error('Failed to parse error response:', error);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    // Handle errors
    xhr.onerror = function() {
      console.error('Network error during Cloudinary upload');
      reject(new Error('Network error during upload. Please check your internet connection.'));
    };
    
    // Open connection and send the request
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);
    xhr.send(formData);
  });
};

/**
 * Generates a Cloudinary URL with transformations
 * 
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns Transformed image URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'crop';
    quality?: number;
  } = {}
): string => {
  const { width, height, crop = 'fill', quality = 90 } = options;
  
  let transformations = `q_${quality},f_auto`;
  
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (crop) transformations += `,c_${crop}`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
