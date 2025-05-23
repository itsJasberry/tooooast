import FaqSection from "@/components/animata/accordion/faq";
import GlowingCard from "@/components/animata/card/glowing-card";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import Tools from "@/components/sections/Tools";
import WayOfWork from "@/components/sections/WayOfWork";
import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "HomePage",
  });

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.webtoast.dev' 
    : 'http://localhost:3000';
  
  const canonicalUrl = locale === 'en' ? `${baseUrl}/en` : baseUrl;

  return {
    title: t("title"),
    description: t("description"),
    
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-home.jpg`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    
    twitter: {
      title: t("title"),
      description: t("description"),
      images: [`${baseUrl}/og-home.jpg`],
    },

    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "HomePage",
  });

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.webtoast.dev' 
    : 'http://localhost:3000';

  // Schema.org JSON-LD dla lepszego SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": t("siteName"),
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": t("description"),
    "foundingDate": "2024", // Dostosuj do rzeczywistej daty
    "founder": {
      "@type": "Person",
      "name": t("founderName") // Dodaj do tłumaczeń
    },
    "sameAs": [
      "https://twitter.com/webtoast_dev", // Twoje social media
      "https://linkedin.com/company/webtoast",
      "https://github.com/webtoast"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@webtoast.dev" // Twój email
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL" // lub gdzie jesteś
    },
    "offers": {
      "@type": "AggregateOffer",
      "description": t("servicesDescription"),
      "priceCurrency": "USD"
    }
  };

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t("homeTitle"),
        "item": locale === 'en' ? `${baseUrl}/en` : baseUrl
      }
    ]
  };

  // Website Schema
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t("siteName"),
    "url": baseUrl,
    "description": t("description"),
    "inLanguage": locale === 'pl' ? 'pl-PL' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* JSON-LD Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      
      <Hero />
      <Tools />
      <WayOfWork />
      <GlowingCard />
      <Pricing />
      <Testimonials />
      <FaqSection />
      {/* Inne komponenty */}
    </>
  );
};

export default Page;