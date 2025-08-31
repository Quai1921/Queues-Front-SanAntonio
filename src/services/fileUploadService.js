import { apiClient } from './authService';

class FileUploadService {
    
    async uploadFile(file, folder = 'general', onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        try {
            const response = await apiClient.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                }
            });
            
            return response.data.data;
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            throw new Error(
                error.response?.data?.message || 'Error al subir archivo'
            );
        }
    }
    
    async deleteFile(fileUrl) {
        try {
            await apiClient.delete('/files', {
                params: { url: fileUrl }
            });
        } catch (error) {
            console.error('Error eliminando archivo:', error);
            throw new Error('Error al eliminar archivo');
        }
    }
    
    validateFile(file, maxSizeMB = 50) {
        const errors = [];
        
        if (!file) {
            errors.push('No se seleccionó ningún archivo');
            return errors;
        }
        
        // Validar tamaño
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            errors.push(`El archivo es demasiado grande (máximo ${maxSizeMB}MB)`);
        }
        
        // Validar tipo
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/webm',
            'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            errors.push('Tipo de archivo no permitido');
        }
        
        return errors;
    }
}

export default new FileUploadService();