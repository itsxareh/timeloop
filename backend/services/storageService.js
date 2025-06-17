// services/storageService.js
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from '../firebase/config';

class StorageService {
  
  // Upload profile image
  async uploadProfileImage(userId, file) {
    try {
      const fileName = `profile_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `profile-images/${userId}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size
      };
    } catch (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
  }
  
  // Upload time capsule media
  async uploadCapsuleMedia(userId, capsuleId, file, onProgress = null) {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `time-capsules/${userId}/${capsuleId}/${fileName}`);
      
      if (onProgress) {
        // Use resumable upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              reject(new Error(`Upload failed: ${error.message}`));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  url: downloadURL,
                  path: uploadTask.snapshot.ref.fullPath,
                  size: uploadTask.snapshot.metadata.size,
                  type: file.type
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Simple upload
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          url: downloadURL,
          path: snapshot.ref.fullPath,
          size: snapshot.metadata.size,
          type: file.type
        };
      }
    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }
  
  // Upload multiple files
  async uploadMultipleFiles(userId, capsuleId, files, onProgress = null) {
    try {
      const uploadPromises = files.map((file, index) => {
        return this.uploadCapsuleMedia(userId, capsuleId, file, 
          onProgress ? (progress) => onProgress(index, progress) : null
        );
      });
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }
  
  // Delete file
  async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
  
  // Get all files for a user's capsule
  async getCapsuleFiles(userId, capsuleId) {
    try {
      const listRef = ref(storage, `time-capsules/${userId}/${capsuleId}`);
      const result = await listAll(listRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url: url
          };
        })
      );
      
      return files;
    } catch (error) {
      throw new Error(`Failed to get capsule files: ${error.message}`);
    }
  }
  
  // Validate file before upload
  validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB default
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }
    
    return true;
  }
  
  // Generate thumbnail for images
  async generateThumbnail(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 200;
        const maxHeight = 200;
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Get file info without downloading
  async getFileMetadata(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      const metadata = await getMetadata(fileRef);
      
      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

export default new StorageService();

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  return '📎';
};