import axios from 'axios';

/**
 * Cấu hình Cloudinary từ bản Web
 */
const CLOUD_NAME = 'dfbhdcow9';
const UPLOAD_PRESET = 'raw4ycip';

/**
 * Tải ảnh lên Cloudinary cho React Native
 * @param {object} imageObject - Đối tượng ảnh (thường lấy từ ImagePicker)
 * { uri: string, type: string, name: string }
 * @returns {Promise<string>} URL của ảnh sau khi tải lên thành công
 */
export const uploadToCloudinary = async (imageObject) => {
  if (!imageObject || !imageObject.uri) {
    throw new Error('Dữ liệu ảnh không hợp lệ');
  }

  // Chuẩn bị FormData theo định dạng React Native yêu cầu
  const formData = new FormData();
  
  // Quan trọng: Phải định dạng đúng cho file trong React Native
  formData.append('file', {
    uri: imageObject.uri,
    type: imageObject.type || 'image/jpeg',
    name: imageObject.name || `avatar_${Date.now()}.jpg`,
  });
  
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error.response?.data || error.message);
    throw new Error('Tải ảnh lên Cloudinary thất bại');
  }
};

export default uploadToCloudinary;
