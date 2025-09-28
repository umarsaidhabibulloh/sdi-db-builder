// app/layout.tsx
import MainLayout from '@/components/MainLayout';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <AppRouterCacheProvider options={{ key: 'css' }}>
        <body className={inter.className}>
          <MainLayout>
            {children}
          </MainLayout>
          </body>
      </AppRouterCacheProvider>
    </html>
  );
}
