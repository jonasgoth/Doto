import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Doto',
  description: 'Personal productivity — daily focus, backlog, and plans.',
  icons: {
    icon: '/icon.svg',
  },
};

// Inline script runs before React hydrates to avoid a flash of wrong theme.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
