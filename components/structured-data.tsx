export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Checkit V7",
        "applicationCategory": "FoodServiceManagement",
        "operatingSystem": "Web, iOS (coming soon), Android (coming soon)",
        "offers": {
          "@type": "Offer",
          "price": "499",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock"
        },
        "description": "Vision-based food service software for multi-site operations. Point camera, form auto-fills. Upload menu, labels print in 2 minutes.",
        "featureList": [
          "Vision-based form filling",
          "Menu-to-label automation",
          "Voice-to-text food probing",
          "Wireless temperature sensors",
          "Excel/image checklist upload",
          "Real-time multi-site dashboard",
          "Automated prep label printing",
          "Temperature monitoring and alerts"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "Organization",
        "name": "Checkit V7",
        "url": "https://checkitv7.com",
        "logo": "https://checkitv7.com/v7-logo.svg",
        "sameAs": [],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@checkitv7.com",
          "contactType": "Customer Service"
        }
      },
      {
        "@type": "WebSite",
        "name": "Checkit V7",
        "url": "https://checkitv7.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://checkitv7.com/?s={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the best food safety software for multi-location operations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Checkit V7 is designed specifically for multi-site food service operations including senior living facilities, hospitals, stadiums, and contract food service providers. Key features include vision-based form filling (point camera, form auto-fills), menu-to-label automation (2-minute process), and real-time temperature monitoring across all locations. Pricing is transparent at $499/month with a free tier available."
            }
          },
          {
            "@type": "Question",
            "name": "How does Checkit V7 compare to Jolt?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Checkit V7 offers vision-based form filling (Jolt requires manual entry), menu-to-label automation (not available in Jolt), 30-second form creation (Jolt takes 30+ minutes), voice-to-text probing, and transparent pricing at $499/month. Checkit is 160x faster end-to-end for typical operations."
            }
          },
          {
            "@type": "Question",
            "name": "What is vision-based form filling?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Vision-based form filling allows you to point your phone camera at kitchen equipment, staff, or facilities during inspections. The system recognizes what it sees (hairnets, thermometers, cleaning stations) and automatically fills compliance checklists in real-time. This is 10x faster than manual entry and includes video evidence attached to each observation."
            }
          },
          {
            "@type": "Question",
            "name": "How does menu-to-label automation work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Upload a photo of your menu or Excel file. Checkit's image recognition extracts ingredients, calculates shelf life, flags allergens (dairy, gluten, nuts), and generates FDA-compliant prep labels. The entire process takes 2 minutes and prints directly to Zebra printers. Traditional methods take 4-6 hours for a 50-item menu."
            }
          },
          {
            "@type": "Question",
            "name": "What is Checkit V7 pricing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Checkit V7 offers three tiers: Free (1 checklist, 1 location, all core features, no credit card), Pro ($499/month for unlimited checklists, unlimited locations, sensor integration, priority support, label printing), and Enterprise (custom pricing with white-label options, API access, dedicated manager)."
            }
          },
          {
            "@type": "Question",
            "name": "Does Checkit V7 work with temperature sensors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Checkit V7 integrates with Disruptive Technologies wireless fridge/freezer sensors that monitor temps 24/7. The system provides instant alerts before violations happen and digitizes food probing with voice-to-text (e.g., say 'Chicken breast, 165°F' and it's automatically logged)."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

