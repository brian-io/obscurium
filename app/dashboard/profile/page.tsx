import { Suspense } from 'react';
import { getUser } from '@/app/lib/data'; // You'll need to implement this function
import ProfileForm from '@/app/components/user/ProfileForm';
import { User } from '@/app/lib/definitions';
import { auth } from '@/auth';
import DashboardSkeleton from '@/app/components/global/Skeletons';

export default async function ProfilePage() {
  // Get the current session
  const session = await auth();
  
  if (!session || !session.user?.id) {
    throw new Error('User not authenticated');
  }
  const sessEmail = session.user.email!
  // Option 1: Use your existing getUser function if it can fetch from your database directly
  const user = await getUser(sessEmail);
  
   
  
  // Then passes it as props to the client component
  return (
      <ProfileForm
        id={user.id}
        name={user.name}
        email={user.email}
        image_url={user.image_url}
      />
  );
}