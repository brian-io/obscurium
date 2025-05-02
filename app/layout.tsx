import '@/app/global.css'
import { inter } from '@/app/lib/fonts'
import { Metadata } from 'next';

export const metadata:Metadata = {
  title: {
    template: '%s |Obscurium Logistics',
    default: 'Obscurium Logistics',
  },
  description: 'Obscurium Logistics offers cutting-edge logistics and supply chain solutions for businesses of all sizes. Contact us today for a consultation.',
}

export default function RootLayout({
  children, 
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
