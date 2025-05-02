import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';
import { auth } from '@/auth';
import { updateUser, updateUserImage } from '@/app/lib/data';

// Helper function for structured API responses
function createResponse(data: any, status = 200) {
  return NextResponse.json(
    { 
      success: status >= 200 && status < 300,
      data,
    }, 
    { status }
  );
}

function createErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    }, 
    { status }
  );
}

// Generate signed upload params
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userId = session.user.id;
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Additional parameters for better security and organization
    const params = {
      timestamp,
      folder: 'profile_images',
      upload_preset: 'user_uploads', // Create a preset in Cloudinary with restrictions
      public_id: `user_${userId}_${timestamp}`, // Associate upload with user
      eager: 'c_fill,g_face,w_300,h_300', // Auto crop to face
      allowed_formats: 'jpg,png,webp', // Restrict formats
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return createResponse({
      ...params,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Error generating upload signature:', error);
    return createErrorResponse('Failed to generate upload signature', 500);
  }
}

// Handle the post-upload callback
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userId = session.user.id!;

    
    // Parse the JSON body
    const body = await request.json();
    

    // Validate required fields
    if (!body.public_id || !body.secure_url) {
      return createErrorResponse('Missing image data', 400);
    }
    
    // Verify this upload belongs to this user
    // This assumes your public_id contains the user ID as shown in GET method
    const expectedPublicIdPrefix = `user_${userId}`;
    if (!body.public_id.includes(expectedPublicIdPrefix)) {
      return createErrorResponse('Invalid upload information', 403);
    }
    
    try {
        // Check if this is a signature request or an update after successful upload
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            // This is an update after successful upload to Cloudinary
            const { public_id, secure_url } = await request.json();
            
            // Update user profile with new image URL
            const updatedUser = await updateUserImage(userId, secure_url);
            
            return createResponse({
                message: 'Profile image updated',
                imageUrl: secure_url,
              });

        } else {
            // This is a signature request for uploading to Cloudinary
            // Generate a timestamp and signature for Cloudinary upload
            const timestamp = Math.round(new Date().getTime() / 1000);
            const folder = 'profile_pictures';
            const public_id = `user_${userId}_${timestamp}`;
            
            // Create signature string
            const signatureString = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
            const signature = require('crypto')
                .createHash('sha1')
                .update(signatureString)
                .digest('hex');
            
            return createResponse({
                message: 'Profile image updated successfully',
                data: {
                    signature,
                    timestamp,
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                    apiKey: process.env.CLOUDINARY_API_KEY,
                    folder,
                    public_id
                }
            });
        }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse('Failed to update profile image', 500);
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

