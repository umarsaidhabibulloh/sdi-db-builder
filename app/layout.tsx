// app/layout.tsx
import MainLayout from '@/components/MainLayout';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Inter } from 'next/font/google';
import { ensureBaseTables } from '@/lib/db/init';
import MuiProvider from './providers/MuiProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SDI DB Builder',
  description: 'Database builder app',
  icons: [
    {
      src: '/favicon.ico',
      sizes: 'any',
      type: 'image/x-icon',
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useEffect(() => {
  //   fetch("/api/bootstrap").catch(console.error);
  // }, []);

  await ensureBaseTables();

  return (
    <html lang="en" suppressHydrationWarning>
      <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
        <MuiProvider>
          <body className={inter.className}>
            <MainLayout>{children}</MainLayout>
          </body>
        </MuiProvider>
      </AppRouterCacheProvider>
    </html>
  );
}
