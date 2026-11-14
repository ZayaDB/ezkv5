import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AppBottomNav from '@/components/layout/AppBottomNav';
import Chatbot from '@/components/chatbot/Chatbot';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const title = 'LNK — Learn · Network · Keep';
  const description = t('footerTagline');
  return {
    metadataBase: new URL('https://ezkv5.netlify.app'),
    title: { default: title, template: '%s · LNK' },
    description,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/brand/lnk-icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title,
      description,
      siteName: 'LNK',
      images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: title }],
      locale: locale === 'kr' ? 'ko_KR' : locale === 'mn' ? 'mn_MN' : 'en_US',
      type: 'website',
    },
    manifest: '/site.webmanifest',
    twitter: { card: 'summary_large_image', title, description, images: ['/brand/og-image.png'] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  // Figma 기준 라이트가 기본. 사용자가 다크를 고른 경우에만 다크
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <main className="flex-1 pt-20 pb-16 md:pb-0">{children}</main>
            <Footer />
            <AppBottomNav />
            <Chatbot />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

