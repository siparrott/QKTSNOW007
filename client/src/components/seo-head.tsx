import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string;
  type?: string;
}

export default function SEOHead({ 
  title = "QuoteKit.ai – AI-Powered Quote Calculators for Service Businesses", 
  description = "Create intelligent quote calculators for 50+ service industries. AI-powered pricing, instant quotes, and seamless lead capture. Boost conversions by 300%.", 
  url = "https://quotekit.ai",
  image = "https://quotekit.ai/og-image.jpg",
  keywords = "quote calculator, AI quotes, service pricing, automated quotes, pricing calculator, lead generation",
  type = "website"
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph meta tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'QuoteKit.ai', true);
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@QuoteKitAI');
    
    // Additional SEO tags
    updateMetaTag('author', 'QuoteKit.ai Team');
    updateMetaTag('language', 'en');
    updateMetaTag('theme-color', '#06D6A0');
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
  }, [title, description, url, image, keywords, type]);

  return null; // This component only updates the document head
}