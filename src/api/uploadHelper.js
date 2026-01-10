/**
 * Upload Helper - Centralized upload functionality
 * Converts files to base64 data URLs for Vercel compatibility
 */

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BACKEND_URL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

export async function uploadImage(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Convert file to base64 data URL directly (client-side)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result; // format: data:image/...;base64,...
        console.log('✅ Image converted to base64 (size:', base64DataUrl.length, 'bytes)');
        resolve(base64DataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadResume(file) {
  try {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // Convert resume to base64 data URL directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result;
        console.log('✅ Resume converted to base64');
        resolve(base64DataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    throw error;
  }
}
