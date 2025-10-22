import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: any;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Nirwana Stays - Pawna Lake Camping Resort | Luxury Accommodations & Adventure Activities",
  description = "Experience nature's paradise at Nirwana Stays, the premier Pawna Lake camping resort. Luxury accommodations, adventure activities, and unforgettable memories await.",
  keywords = "Pawna Lake camping, luxury camping resort, glamping Maharashtra, cottage booking, villa rental, adventure activities, lakeside accommodation, nature retreat",
  canonical,
  ogImage = "https://nirwanastays.com/og-image.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData
}) => {
  const fullTitle = title.includes("Nirwana Stays") ? title : `${title} | Nirwana Stays`;
  const canonicalUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Nirwana Stays" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Nirwana Stays" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Predefined SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: "Nirwana Stays - Pawna Lake Camping Resort | Luxury Accommodations & Adventure Activities",
    description: "Experience nature's paradise at Nirwana Stays, the premier Pawna Lake camping resort. Luxury accommodations, adventure activities, and unforgettable memories await.",
    keywords: "Pawna Lake camping, luxury camping resort, glamping Maharashtra, cottage booking, villa rental, adventure activities, lakeside accommodation, nature retreat",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": "Nirwana Stays",
      "description": "Premier Pawna Lake camping resort offering luxury accommodations and adventure activities",
      "url": "https://nirwanastays.com",
      "telephone": "+91-9021408308",
      "email": "info@nirwanastays.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pawna Lake",
        "addressLocality": "Lonavala",
        "addressRegion": "Maharashtra",
        "postalCode": "410401",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "18.7604",
        "longitude": "73.4070"
      },
      "image": "https://nirwanastays.com/og-image.jpg",
      "priceRange": "₹₹₹",
      "amenityFeature": [
        "Lakeside Location",
        "Adventure Activities",
        "Bonfire Nights",
        "Water Sports",
        "BBQ & Dining",
        "Music Nights",
        "Stargazing"
      ],
      "starRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  },
  
  about: {
    title: "About Nirwana Stays - Pawna Lake Resort | Our Story & Mission",
    description: "Discover the story behind Nirwana Stays, your gateway to nature's paradise at Pawna Lake. Learn about our mission to provide luxury camping experiences.",
    keywords: "about Nirwana Stays, Pawna Lake resort story, luxury camping mission, nature retreat history",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Nirwana Stays",
      "description": "Learn about Nirwana Stays, the premier Pawna Lake camping resort",
      "url": "https://nirwanastays.com/about"
    }
  },
  
  gallery: {
    title: "Photo Gallery - Nirwana Stays Pawna Lake | Resort Images & Activities",
    description: "Explore our photo gallery showcasing the beauty of Nirwana Stays at Pawna Lake. See our accommodations, activities, and scenic views.",
    keywords: "Nirwana Stays gallery, Pawna Lake photos, resort images, camping photos, accommodation pictures",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Nirwana Stays Gallery",
      "description": "Photo gallery of Nirwana Stays Pawna Lake resort",
      "url": "https://nirwanastays.com/gallery"
    }
  },
  
  accommodation: (accommodation: any) => ({
    title: `${accommodation.name} - ${accommodation.type} at Nirwana Stays Pawna Lake`,
    description: `Book ${accommodation.name} ${accommodation.type} at Nirwana Stays. ${accommodation.description || 'Luxury accommodation with stunning lake views.'}`,
    keywords: `${accommodation.name}, ${accommodation.type} booking, Pawna Lake accommodation, Nirwana Stays ${accommodation.type}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Accommodation",
      "name": accommodation.name,
      "description": accommodation.description || `Luxury ${accommodation.type} at Nirwana Stays`,
      "url": `https://nirwanastays.com/accommodation/${accommodation.id}`,
      "image": accommodation.image,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pawna Lake",
        "addressLocality": "Lonavala",
        "addressRegion": "Maharashtra",
        "postalCode": "410401",
        "addressCountry": "IN"
      },
      "priceRange": `₹${accommodation.price}`,
      "amenityFeature": accommodation.inclusions || [],
      "occupancy": {
        "@type": "QuantitativeValue",
        "maxValue": accommodation.max_guest || 4
      }
    }
  })
};


