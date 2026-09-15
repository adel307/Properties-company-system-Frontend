import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Fieldwork | Real estate operations',
  description: 'A calm command center for construction and property operations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1480px] gap-6 px-5 py-6 lg:px-8">
          <Sidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
