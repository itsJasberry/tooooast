// /src/app/[locale]/layout.tsx
import { Geist, Geist_Mono, Lato, Open_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getMessages, getTranslations } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { locales } from "@/src/i18n/locales";
import Footer from "@/components/sections/Footer";
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "LocaleLayout",
  });

  // Bazowy URL Twojej strony
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.webtoast.dev' 
    : 'http://localhost:3000';
  
  // Canonical URL - dla polskiego bez /pl, dla angielskiego z /en
  const canonicalUrl = locale === 'en' ? `${baseUrl}/en` : baseUrl;
  
  // Alternate URLs dla hreflang
  const alternateUrls = {
    'pl': baseUrl,
    'en': `${baseUrl}/en`,
  };

  return {
    title: {
      template: `%s | ${t("siteName")}`,
      default: t("title"),
    },
    description: t("description"),
    keywords: t("keywords"), // Dodaj do tłumaczeń
    authors: [{ name: t("authorName") }],
    creator: t("authorName"),
    publisher: t("siteName"),
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'pl' ? 'pl_PL' : 'en_US',
      url: canonicalUrl,
      title: t("title"),
      description: t("description"),
      siteName: t("siteName"),
      images: [
        {
          url: `${baseUrl}/og-image.jpg`, // Dodaj swój OG image
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: t("title"),
      description: t("description"),
      images: [`${baseUrl}/og-image.jpg`],
      creator: '@webtoast_dev', // Twój Twitter handle
    },

    // Canonical i alternate URLs
    alternates: {
      canonical: canonicalUrl,
      languages: alternateUrls,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification (dodaj swoje)
    verification: {
      google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },

    // Inne metadata
    category: 'technology',
    classification: 'Business',
    
    // Schema.org JSON-LD będzie dodane w page.tsx
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${openSans.variable} ${merriweather.variable}`}>
      <body className={`${geistSans.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}