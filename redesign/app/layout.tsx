import type { Metadata, Viewport } from 'next';
// self-hosted via fontsource (next/font/google is flaky behind some CDNs)
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/cyrillic-300.css';
import '@fontsource/inter/cyrillic-400.css';
import '@fontsource/inter/cyrillic-500.css';
import '@fontsource/merriweather/latin-400.css';
import '@fontsource/merriweather/latin-400-italic.css';
import '@fontsource/merriweather/cyrillic-400.css';
import '@fontsource/merriweather/cyrillic-400-italic.css';
import '@fontsource/oswald/latin-400.css';
import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/cyrillic-400.css';
import '@fontsource/oswald/cyrillic-500.css';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const title = 'PSB Consulting — accounting and legal consulting';
const description = 'Ready-made companies with bank accounts, turnkey LLC registration, corporate documents, state register changes and digital signatures. Phone: +7 963 04-80-28.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://psb-consulting.erythro.ai'),
  title, description,
  openGraph: { title, description, url: '/', siteName: 'PSB Consulting', type: 'website', locale: 'en_US', alternateLocale: ['ru_RU'] },
  twitter: { card: 'summary_large_image', title, description },
};
export const viewport: Viewport = { themeColor: '#0f0f0e', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* decide the static (no-animation) layout before first paint, so phones never flash the animated one */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.toggle('static',matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)').matches)" }} />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
