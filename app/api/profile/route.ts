// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateUser } from '@/app/lib/data';
import { User } from '@/app/lib/definitions';

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const { userId, ...profileData } = data;

    // Auth check — ensure user is only updating their own profile
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    // Perform the update
    const updatedUser = await updateUser(userId, profileData as Partial<User>);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
