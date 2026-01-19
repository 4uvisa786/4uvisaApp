import axios from "axios";

/**
 * Upload multiple files/images to Cloudinary
 * @param {Array} files - Array from FilePicker / DocumentPicker
 * @returns {Promise<Array>} uploaded file info
 */
export const uploadMultipleToCloudinary = async (files = []) => {
const CLOUD_NAME = "djxtyskrd";
const UPLOAD_PRESET = "4UVISA";

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: file.name || `file_${Date.now()}`,
    });

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      filename: response.data.original_filename,
      mimeType: response.data.resource_type,
      url: response.data.secure_url,
      fileId: response.data.public_id,
    };
  });

  return Promise.all(uploadPromises);
};
