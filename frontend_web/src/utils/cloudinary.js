import axios from 'axios';

/**
 * Tải ảnh lên Cloudinary (Unsigned Upload)
 * @param {File} file 
 * @returns {Promise<string>} URL của ảnh sau khi tải lên
 */
export const uploadImage = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Tải ảnh lên thất bại. Vui lòng thử lại.');
    }
};
