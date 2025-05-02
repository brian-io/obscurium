'use client'

import { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function ProfileUpload( { userId, currentImageUrl }: {
    userId?: string;
    currentImageUrl?: string;
} ) {

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>( currentImageUrl || '');
    const [error, setError] = useState<string>('')

    const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');

        try {
            // Get the file from the form
            const form = e.target as HTMLFormElement;
            const fileInput = form.elements.namedItem('file') as HTMLInputElement;
            const file = fileInput.files?.[0];
            
            if (!file) {
                setError('Please select a file');
                setIsUploading(false);
                return;
              }

             // Check file type and size
            if (!file.type.match(/image\/(jpeg|png|webp)/)) {
                setError('File must be a JPG, PNG, or WebP image');
                setIsUploading(false);
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File must be smaller than 5MB');
                setIsUploading(false);
                return;
              }

            const signatureResponse = await fetch('/api/upload', {
                method: 'POST',
            });

            if (!signatureResponse.ok) {
                throw new Error('Failed to get upload signature');
              }

              const { data } = await signatureResponse.json();
      
              // Create form data for Cloudinary
              const formData = new FormData();
              formData.append('file', file);
              formData.append('api_key', data.apiKey);
              formData.append('timestamp', data.timestamp.toString());
              formData.append('signature', data.signature);
              formData.append('folder', data.folder);
              formData.append('public_id', data.public_id);
              
              if (data.upload_preset) {
                formData.append('upload_preset', data.upload_preset);
              }
              
              if (data.eager) {
                formData.append('eager', data.eager);
              }
              
              // Upload to Cloudinary
              const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
                {
                  method: 'POST',
                  body: formData,
                }
              );
              
              if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
              }
              
              const uploadResult = await uploadResponse.json();
              
              // Notify our API about the successful upload
              const saveResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  public_id: uploadResult.public_id,
                  secure_url: uploadResult.secure_url,
                }),
              });
              
              if (!saveResponse.ok) {
                throw new Error('Failed to save profile image');
              }
              
              const saveResult = await saveResponse.json();
              setImageUrl(saveResult.data.imageUrl);
              
            } catch (err) {
              console.error('Upload error:', err);
              setError(err instanceof Error ? err.message : 'Failed to upload image');
            } finally {
              setIsUploading(false);
            }
          }

    return (
        <div className="space-y-4">
      {imageUrl && (
        <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
          <Image 
            src={imageUrl} 
            alt="Profile picture" 
            fill 
            className="object-cover" 
          />
        </div>
      )}
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label 
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or WebP (MAX. 5MB)</p>
            </div>
            <input id="file" name="file" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" />
          </label>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
        </button>
      </form>
    </div>
  );
}
