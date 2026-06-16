import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { SupabaseProvider } from '@/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Ayurveda Assessment',
  description: 'Ayurvedic Prakriti/Vikriti assessment, food diary, and wellness report generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
