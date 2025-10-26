import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

// Helper: success response
function createResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data,
    },
    { status }
  );
}

// Helper: error response
function createErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Direct implementation of updateUserImage using Vercel Postgres
 */
async function updateUserImage(userId: string, imageUrl: string) {
  try {
    const result = await sql`
      UPDATE users 
      SET image_url = ${imageUrl} 
      WHERE id = ${userId}
      RETURNING id, name, email, image_url
    `;
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error updating user image:', error);
    throw error;
  }
}

/**
 * GET /api/user/image
 * Returns signed Cloudinary params for uploading.
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const userId = session.user.id;
    
    // Verify userId is available
    if (!userId) {
      return createErrorResponse('User ID not found in session', 500);
    }
    
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'profile_images';
    const public_id = `user_${userId}_${timestamp}`;
    
    // IMPORTANT: The parameters here MUST match exactly what will be sent to Cloudinary
    // The order is important for signature verification
    const params = {
      eager: 'c_fill,g_face,w_300,h_300',
      folder,
      public_id,
      timestamp,
    };
    
    // Generate signature with exact parameters that will be sent
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

/**
 * POST /api/user/image
 * Expects { public_id, secure_url } from Cloudinary after upload.
 * Updates user profile image in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return createErrorResponse('Expected JSON body', 415);
    }
    
    const userId = session.user.id;
    
    // Verify userId is available
    if (!userId) {
      return createErrorResponse('User ID not found in session', 500);
    }
    
    // Parse JSON body only once
    let body: { public_id?: string; secure_url?: string };
    try {
      body = await request.json();
    } catch (_) {
      return createErrorResponse('Invalid JSON body', 400);
    }
    const { public_id, secure_url } = body;
    
    if (!public_id || !secure_url) {
      return createErrorResponse('Missing image data', 400);
    }
    
    // Validate ownership
    const expectedPrefix = `user_${userId}`;
    if (!public_id.includes(expectedPrefix)) {
      return createErrorResponse('Invalid upload information', 403);
    }
    
    // Update image in DB using Vercel's sql template literals
    try {
      const updatedUser = await updateUserImage(userId, secure_url);
      if (!updatedUser) {
        return createErrorResponse('User not found', 404);
      }
      
      return createResponse({
        message: 'Profile image updated successfully',
        imageUrl: secure_url,
      });
    } catch (error) {
      console.error('Database error:', error);
      return createErrorResponse('Database error updating user image', 500);
    }
  } catch (error) {
    console.error('Error processing image upload:', error);
    return createErrorResponse('Internal server error', 500);
  }
}