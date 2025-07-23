import Helmet from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  keywords?: string;
  structuredData?: object;
}

const defaultProps: SEOProps = {
  title: 'Recipe Catalogue - All Your Recipes In One Place',
  description: 'Stop losing your place to jumping ads and slow recipe sites. Recipe Catalogue organizes all your recipes from any website, Instagram posts, and photos in one clean, ad-free interface.',
  canonical: 'https://recipecatalogue.app',
  ogImage: 'https://recipecatalogue.app/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  keywords: 'recipe organizer, meal planning, recipe collection, cooking app, recipe manager, ad-free recipes, recipe storage',
};

export default function SEO(props: SEOProps) {
  const {
    title = defaultProps.title,
    description = defaultProps.description,
    canonical = defaultProps.canonical,
    ogImage = defaultProps.ogImage,
    ogType = defaultProps.ogType,
    twitterCard = defaultProps.twitterCard,
    keywords = defaultProps.keywords,
    structuredData,
  } = props;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Recipe Catalogue - Organize all your recipes in one place" />
      <meta property="og:site_name" content="Recipe Catalogue" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Recipe Catalogue - Organize all your recipes in one place" />
      
      {/* Additional Meta Tags for SEO */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="author" content="Recipe Catalogue" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      
      {/* Theme and App Meta Tags */}
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Recipe Catalogue" />
      <meta name="application-name" content="Recipe Catalogue" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}