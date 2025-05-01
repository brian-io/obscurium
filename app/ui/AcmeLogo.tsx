import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/lib/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row h-full justify-center text-white`}
    >
      <GlobeAltIcon className="h-8 w-8 rotate-[15deg]" />
      <p className="text-[24px]">Acme</p>
    </div>
  );
}
