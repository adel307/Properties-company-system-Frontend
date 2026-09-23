import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import GlobalAudioRecorder from '@/components/common/GlobalAudioRecorder';

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
      <body className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-teal-500 selection:text-neutral-950 antialiased flex flex-col relative">
        {/* Subtle Background Ambience */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] bg-teal-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <Navbar />
        </header>

        {/* Main Workspace Body */}
        <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:px-8 flex-1">
          {/* Fixed/Sticky Sidebar Container */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-[88px] rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 backdrop-blur-sm">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content Viewport */}
          <main className="min-w-0 flex-1 rounded-2xl border border-neutral-800/60 bg-neutral-900/20 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            {children}
          </main>
        </div>

        {/* Floating Voice Recorder Widget (يمتلك z-50 بداخل المكون) */}
        <GlobalAudioRecorder />

        {/* Global Footer */}
        <footer className="mt-auto border-t border-neutral-800/80 bg-neutral-950 relative z-10">
          <Footer />
        </footer>
      </body>
    </html>
  );
}