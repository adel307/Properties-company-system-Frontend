import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'REC company | Real estate operations',
  description: 'A calm command center for construction and property operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <AppLayout>{children}</AppLayout>
    </html>
  );
}