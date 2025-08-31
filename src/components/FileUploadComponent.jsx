import React, { useState, useRef } from 'react';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import fileUploadService from '../services/fileUploadService';

const FileUploadComponent = ({
    onFileUploaded,
    currentFileUrl = null,
    folder = 'general',
    acceptTypes = 'image/*,video/*,audio/*',
    maxSizeMB = 50
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar archivo
        const validationErrors = fileUploadService.validateFile(file, maxSizeMB);
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        try {
            setError(null);
            setUploading(true);
            setUploadProgress(0);

            const result = await fileUploadService.uploadFile(
                file,
                folder,
                setUploadProgress
            );

            onFileUploaded(result);

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            // Limpiar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!currentFileUrl) return;

        try {
            await fileUploadService.deleteFile(currentFileUrl);
            onFileUploaded(null); // Limpiar archivo actual
        } catch (err) {
            setError('Error al eliminar archivo');
        }
    };

    return (
        <div className="space-y-4">
            {/* Área de upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {!currentFileUrl ? (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptTypes}
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                            id={`file-input-${folder}`}
                        />
                        <label
                            htmlFor={`file-input-${folder}`}
                            className="cursor-pointer"
                        >
                            <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600">
                                Haz clic para seleccionar archivo o arrastra aquí
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Máximo {maxSizeMB}MB
                            </p>
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <InsertDriveFile className="h-8 w-8 text-blue-500" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Archivo cargado</p>
                                <p className="text-xs text-gray-500 truncate max-w-48">
                                    {currentFileUrl.split('/').pop()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                            title="Eliminar archivo"
                        >
                            <Delete />
                        </button>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-center mt-1">
                        Subiendo... {uploadProgress}%
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;