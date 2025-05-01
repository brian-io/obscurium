import AcmeLogo from '@/app/ui/AcmeLogo';
import LoginForm from '@/app/ui/LoginForm';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Login',
};

export default function Login() {
  return (
    <main className="flex items-center justify-center md:h-screen bg-slate-200">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">      
        <LoginForm />
      </div>
    </main>
  );
}