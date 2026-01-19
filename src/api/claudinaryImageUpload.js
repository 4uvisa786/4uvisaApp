// api/uploadImageToCloudinary.js

import { launchImageLibrary } from 'react-native-image-picker'; 
import { Alert } from 'react-native';

// --- CONFIGURATION ---
const CLOUD_NAME = 'djxtyskrd';
const UPLOAD_PRESET = '4UVISA';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
// ---------------------

/**
 * Uploads a local image URI to Cloudinary.
 * @param {string} imageUri - The local URI of the image file.
 * @param {string} fileType - The MIME type of the file (e.g., 'image/jpeg').
 * @returns {Promise<{url: string, publicId: string}>} Cloudinary response data.
 */
export const uploadImageToCloudinary = async (imageUri, fileType) => {
  if (!imageUri || !fileType) {
    throw new Error("Image URI or file type is missing.");
  }

  const formData = new FormData();
  
  const fileName = `upload_${Date.now()}.${fileType.split('/').pop()}`;
  
  formData.append('file', {
    uri: imageUri,
    type: fileType, 
    name: fileName,
  });

  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Cloudinary upload failed.');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };

  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Opens the device gallery to select an image using react-native-image-picker.
 * @returns {Promise<{uri: string, type: string}|null>} The local image data.
 */
export const pickImageFromGallery = async () => {
  const options = {
    mediaType: 'photo',
    quality: 0.7,
    selectionLimit: 1,
  };

  return new Promise((resolve) => {
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        resolve(null);
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
        Alert.alert('Error', `Image picker failed: ${response.error}`);
        resolve(null);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        // Ensure uri and type properties exist, which they do in react-native-image-picker's asset structure
        resolve({
          uri: asset.uri,
          type: asset.type, 
        });
      } else {
        resolve(null);
      }
    });
  });
};
