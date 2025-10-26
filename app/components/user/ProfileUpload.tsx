'use client';

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Types
type ProfileUploadProps = {
  userId?: string;
  currentImageUrl?: string;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  isEditing?: boolean;
};

type UploadSignature = {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  public_id: string;
  cloudName: string;
  eager: string;
};

type FileState = {
  file: File | null;
  previewUrl: string;
  isUploading: boolean;
  uploadProgress: number;
  status: 'idle' | 'preview' | 'uploading' | 'success' | 'error';
  errorMessage: string;
};

// Constants
const ERROR_MESSAGES = {
  NO_FILE: 'Please select an image to upload',
  INVALID_TYPE: 'Please upload a JPG, PNG, or WebP image',
  FILE_TOO_LARGE: 'Image must be smaller than 5MB',
  NETWORK: 'Unable to connect. Please check your internet connection and try again',
  SERVER: 'Something went wrong on our end. Please try again later',
  GENERAL: 'Something went wrong. Please try again',
  UPLOAD_FAILED: 'Failed to upload image. Please try again',
};

const FILE_SIZE_LIMIT_MB = 5;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Utilities
const imageValidator = {
  isValidType: (file: File): boolean => 
    ACCEPTED_FILE_TYPES.includes(file.type),
  
  isValidSize: (file: File): boolean => 
    file.size <= FILE_SIZE_LIMIT_MB * 1024 * 1024,
  
  validate: (file: File) => {
    if (!file) return { 
      valid: false, 
      errorMessage: ERROR_MESSAGES.NO_FILE 
    };
    
    if (!imageValidator.isValidType(file)) return { 
      valid: false, 
      errorMessage: ERROR_MESSAGES.INVALID_TYPE 
    };
    
    if (!imageValidator.isValidSize(file)) return { 
      valid: false, 
      errorMessage: ERROR_MESSAGES.FILE_TOO_LARGE 
    };
    
    return { valid: true, errorMessage: '' };
  }
};

// Service for handling image upload operations
const profileImageService = {
  getUploadSignature: async (): Promise<UploadSignature> => {
    try {
      const response = await fetch('/api/user/image', { 
        method: 'GET', 
        headers: { 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get upload signature:', errorText);
        throw new Error(response.status >= 500 ? ERROR_MESSAGES.SERVER : ERROR_MESSAGES.GENERAL);
      }
      
      return (await response.json()).data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('network')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      throw error;
    }
  },

  uploadToCloudinary: async (
    file: File, 
    signature: UploadSignature, 
    abortController: AbortController,
    onProgress?: (progress: number) => void
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eager', signature.eager);
      formData.append('folder', signature.folder);
      formData.append('public_id', signature.public_id);
      formData.append('timestamp', signature.timestamp.toString());
      formData.append('api_key', signature.apiKey);
      formData.append('signature', signature.signature);

      // Create an XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error(ERROR_MESSAGES.UPLOAD_FAILED));
            }
          } else {
            reject(new Error(xhr.status >= 500 ? ERROR_MESSAGES.SERVER : ERROR_MESSAGES.UPLOAD_FAILED));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error(ERROR_MESSAGES.NETWORK));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`);
        abortController.signal.addEventListener('abort', () => xhr.abort());
        xhr.send(formData);
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('network')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      throw error;
    }
  },

  saveProfileImage: async (
    public_id: string, 
    secure_url: string, 
    abortController: AbortController
  ) => {
    try {
      const response = await fetch('/api/user/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id, secure_url }),
        signal: abortController.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save profile image:', errorText);
        throw new Error(response.status >= 500 ? ERROR_MESSAGES.SERVER : ERROR_MESSAGES.GENERAL);
      }
      
      return (await response.json()).data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('network')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      throw error;
    }
  }
};

// UI Components
const UploadIcon = () => (
  <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const ImagePreview = ({ 
  url, 
  onClick, 
  size = "medium" 
}: { 
  url: string; 
  onClick?: () => void; 
  size?: "small" | "medium" | "large" 
}) => {
  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-64 h-64",
    large: "w-full h-full max-h-[80vh]"
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto rounded-full overflow-hidden`}>
      <Image
        src={url}
        alt="Profile preview"
        fill
        className={`object-cover ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      />
    </div>
  );
};

const ImageModal = ({ 
  isOpen, 
  imageUrl, 
  onClose 
}: { 
  isOpen: boolean; 
  imageUrl: string; 
  onClose: () => void 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-[700px] h-[700px] p-4 animate-scaleIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
        <div className="w-full h-full p-8 flex items-center justify-center">
          <ImagePreview url={imageUrl} size="large" />
        </div>
      </div>
    </div>
  );
};

// Dropzone component
const Dropzone = ({ 
  onFileSelect 
}: { 
  onFileSelect: (file: File) => void 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <div className="flex flex-col items-center justify-center p-6">
          <UploadIcon />
          <p className="mb-2 text-sm text-gray-500 text-center">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-center text-gray-500">
            PNG, JPG or WebP (Max {FILE_SIZE_LIMIT_MB}MB)
          </p>
        </div>
        <input
          id="file"
          name="file"
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          className="hidden"
          accept={ACCEPTED_FILE_TYPES.join(',')}
        />
      </label>
    </div>
  );
};

// Main Component
export default function ProfileUpload({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  isEditing = false
}: ProfileUploadProps) {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    previewUrl: currentImageUrl || '',
    isUploading: false,
    uploadProgress: 0,
    status: 'idle',
    errorMessage: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset the form when leaving edit mode
  useEffect(() => {
    if (!isEditing) {
      handleCancelPreview();
    }
  }, [isEditing]);

  // Update preview URL when currentImageUrl changes
  useEffect(() => {
    if (currentImageUrl && !fileState.file) {
      setFileState(prev => ({ 
        ...prev, 
        previewUrl: currentImageUrl,
        status: currentImageUrl ? 'success' : 'idle'
      }));
    }
  }, [currentImageUrl, fileState.file]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (fileState.previewUrl && fileState.previewUrl !== currentImageUrl) {
        URL.revokeObjectURL(fileState.previewUrl);
      }
    };
  }, [fileState.previewUrl, currentImageUrl]);

  const handleCancelPreview = useCallback(() => {
    // Revoke any created object URLs before resetting
    if (fileState.previewUrl && fileState.previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(fileState.previewUrl);
    }

    setFileState({
      file: null,
      previewUrl: currentImageUrl || '',
      isUploading: false,
      uploadProgress: 0,
      status: currentImageUrl ? 'success' : 'idle',
      errorMessage: ''
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [currentImageUrl, fileState.previewUrl]);

  const handleFileSelection = (file: File) => {
    // Clean up previous preview URL if needed
    if (fileState.previewUrl && fileState.previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(fileState.previewUrl);
    }

    // Validate file
    const validation = imageValidator.validate(file);
    if (!validation.valid) {
      setFileState(prev => ({ 
        ...prev, 
        errorMessage: validation.errorMessage, 
        status: 'error' 
      }));
      return;
    }

    // Create preview and update state
    setFileState({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: false,
      uploadProgress: 0,
      status: 'preview',
      errorMessage: ''
    });
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!fileState.file) {
      setFileState(prev => ({ 
        ...prev, 
        errorMessage: ERROR_MESSAGES.NO_FILE, 
        status: 'error' 
      }));
      return;
    }

    // Start upload process
    setFileState(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadProgress: 0,
      status: 'uploading', 
      errorMessage: '' 
    }));

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Step 1: Get upload signature
      const signature = await profileImageService.getUploadSignature();
      
      // Step 2: Upload to Cloudinary with progress tracking
      const uploadResult: any = await profileImageService.uploadToCloudinary(
        fileState.file, 
        signature, 
        controller,
        (progress) => {
          setFileState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );
      
      // Step 3: Save the image URL to user profile
      const saveResult = await profileImageService.saveProfileImage(
        uploadResult.public_id, 
        uploadResult.secure_url, 
        controller
      );
      
      // Success - update state
      setFileState({
        file: null,
        previewUrl: saveResult.imageUrl,
        isUploading: false,
        uploadProgress: 100,
        status: 'success',
        errorMessage: ''
      });
      
      // Notify parent component
      onUploadSuccess?.(saveResult.imageUrl);
      setAbortController(null);
      
    } catch (err) {
      // Only handle errors that aren't from user cancellation
      if ((err as Error).message !== 'Upload cancelled') {
        const errorMessage = (err as Error).message || ERROR_MESSAGES.GENERAL;
        
        setFileState(prev => ({ 
          ...prev, 
          errorMessage, 
          isUploading: false,
          status: 'error' 
        }));
        
        onUploadError?.(errorMessage);
      }
      setAbortController(null);
    }
  };

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setFileState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadProgress: 0,
        status: prev.file ? 'preview' : 'idle'
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Profile Image Preview */}
      {fileState.previewUrl && (
        <div className="mb-6">
          <ImagePreview 
            url={fileState.previewUrl} 
            onClick={() => setShowModal(true)}
          />
        </div>
      )}

      {/* Full-size Preview Modal */}
      <ImageModal 
        isOpen={showModal} 
        imageUrl={fileState.previewUrl} 
        onClose={() => setShowModal(false)} 
      />

      {/* Upload Form */}
      {(!currentImageUrl || isEditing) && (
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Progress bar for uploads */}
          {fileState.isUploading && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">
                Uploading... {fileState.uploadProgress}%
              </p>
              <ProgressBar progress={fileState.uploadProgress} />
            </div>
          )}

          {/* File dropzone - show only when not previewing/uploading */}
          {!fileState.file && !fileState.isUploading && (
            <Dropzone onFileSelect={handleFileSelection} />
          )}

          {/* Error message display */}
          {fileState.errorMessage && (
            <ErrorAlert message={fileState.errorMessage} />
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Cancel preview button */}
            {fileState.file && !fileState.isUploading && (
              <button
                type="button"
                onClick={handleCancelPreview}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg h-10 transition-colors"
              >
                Cancel
              </button>
            )}
            
            {/* Cancel upload button */}
            {fileState.isUploading && (
              <button
                type="button"
                onClick={handleCancelUpload}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg h-10 transition-colors"
              >
                Cancel 
              </button>
            )}
            
            {/* Upload button */}
            <button
              type="submit"
              disabled={fileState.isUploading || !fileState.file}
              className={`
                ${fileState.file && !fileState.isUploading ? 'flex-1' : 'w-full'} 
                py-2 px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium 
                rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors
              `}
            >
              {fileState.isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}