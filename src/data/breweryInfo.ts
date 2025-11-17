/**
 * Brewery information for [BREWERY_NAME]
 * This file serves as a single source of truth for company details
 * used throughout the application.
 *
 * =====================
 * SECTION INDEX (searchable):
 * - Interfaces & Types
 * - Main Brewery Info Object (breweryInfo)
 *   - Name, Tagline, Address, Contact, Social, Website
 *   - Description, Business Hours, Awards, Brewery Specs, Location
 * - Featured Beers (featuredBeers)
 * - Food Menu (foodMenu)
 * - Event Types (eventTypes)
 * - Areas Served (areasServed)
 * - SEO Data (seoData)
 * - Structured Data Generators
 *   - generateOrganizationSchema
 *   - generateWebPageSchema
 *   - generateFAQSchema
 *   - generateAllStructuredData
 * - SEO Data Helper (getSEOData)
 * - Default Export
 * =====================
 */

import { businessHoursService } from '../utils/businessHours';
import { getNextUpcomingEvents } from '../hooks/useOptimizedEvents';
import type { Event } from '../hooks/useOptimizedEvents';

/**
 * =====================
 * Interfaces & Types
 * =====================
 */
export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  lastModified: string;
}

export interface BeerInfo {
  name: string;
  description: string;
  category: 'ipa' | 'stout' | 'lager' | 'wheat' | 'sour' | 'seasonal';
  status: 'on-tap' | 'seasonal' | 'coming-soon' | 'limited-edition' | 'sold-out' | 'archived' | 'retired';
}

export interface EventInfo {
  name: string;
  description: string;
  type: 'live-music' | 'food-truck' | 'trivia' | 'tasting' | 'private-event';
}

export interface FoodInfo {
  name: string;
  description: string;
  category: 'appetizer' | 'entree' | 'dessert' | 'special';
  price?: string;
}

/**
 * =====================
 * Main Brewery Info Object (breweryInfo)
 * =====================
 *
 * Contains all core company information:
 * - Name, Tagline, Address, Contact, Social, Website
 * - Description, Business Hours, Awards, Brewery Specs, Location
 */
export const breweryInfo = {
  name: 'Broken Loop Brewing',
  shortName: 'Broken Loop',
  shortTagline: 'The Loop Was Made to Be Broken',
  tagline: 'Branch out from the usual. We\’ll pour something worth the detour',
  
  /**
   * Address Information
   * - street, city, state, zip, full, coordinates
   */
  address: {
    street: '4302 Albany St',
    city: 'Albany',
    state: 'NY',
    zip: '12205-4609',
    full: '4302 Albany St, Albany, NY 12205-4609',
    coordinates: {
      latitude: 42.72801303149738,
      longitude: -73.85769613719643
    }
  },
  
  /**
   * Contact Information
   * - phone, email, reservations
   */
  contact: {
    phone: {
      raw: '5551234567',
      formatted: '(555) 123-4567',
      link: 'tel:5551234567'
    },
    email: 'hello@brokenloopbrewing.com',
    reservations: 'reservations@brokenloopbrewing.com'
  },
  
  /**
   * Social Media Links
   * - facebook, instagram, twitter
   */
  social: {
    facebook: 'https://www.facebook.com/groups/1659356340868214/user/61560949642949/',
    instagram: 'https://www.instagram.com/brokenloopbrewingco/',
    twitter: 'https://twitter.com/brokenloopbrew',
  },
  
  /**
   * Website Information
   * - domain, baseUrl
   */
  website: {
    domain: 'brokenloopbrewing.com',
    baseUrl: 'https://brokenloopbrewing.com'
  },
  
  /**
   * Descriptions
   * - Long and short descriptions for marketing/SEO
   */
  description: 'Broken Loop Brewing is a craft brewery dedicated to creating exceptional beers that honor traditional brewing methods while embracing innovation. Located in Albany, NY, we focus on quality ingredients, time-tested techniques, and community connection.',
  shortDescription: 'Come enjoy craft beer on our spacious patio in Albany, NY!',
  
  /**
   * Business Hours Integration
   * - getBusinessHours: Returns weekly hours
   * - getCurrentStatus: Returns open/closed status and next open/close time
   */
  getBusinessHours: () => businessHoursService.getBusinessHours(),
  getCurrentStatus: () => {
    const message = businessHoursService.getHoursMessage();
    // Parse the message to extract status information
    // More precise check: must start with "Open " (with space) or "Closing" to be considered open
    // This prevents "Opening" from being treated as "Open"
    const isOpen = message.startsWith('Open ') || message.startsWith('Closing');
    
    let closingTime = '';
    let nextOpenDay = '';
    let openingTime = '';
    
    if (isOpen) {
      // Extract closing time from messages like "Open today until 9:00 PM" or "Closing soon at 9:00 PM"
      const untilMatch = message.match(/until (\d{1,2}:\d{2} [AP]M)/);
      const atMatch = message.match(/at (\d{1,2}:\d{2} [AP]M)/);
      closingTime = untilMatch ? untilMatch[1] : (atMatch ? atMatch[1] : '');
    } else {
      // Extract next opening info from messages like "Closed - Opens Monday at 3:00 PM" or "Opening today at 3:00 PM"
      const opensMatch = message.match(/Opens (\w+) at (\d{1,2}:\d{2} [AP]M)/);
      const openingMatch = message.match(/Opening (\w+) at (\d{1,2}:\d{2} [AP]M)/);
      
      if (opensMatch) {
        nextOpenDay = opensMatch[1];
        openingTime = opensMatch[2];
      } else if (openingMatch) {
        nextOpenDay = openingMatch[1];
        openingTime = openingMatch[2];
      }
    }
    
    return {
      isOpen,
      closingTime,
      nextOpenDay,
      openingTime,  
      message
    };
  },
  
  /**
   * Awards and Recognition
   * - List of awards (year, title, organization)
   */
  awards: [
    {
      year: '',
      title: '',
      organization: ''
    }
  ],
  
  /**
   * Brewery Specifications
   * - established, capacity, style, specialties
   */
  brewery: {
    established: '2025',
    capacity: '7 bbl brewhouse', // e.g., "15-barrel system"
    style: 'Craft Brewery', // e.g., "Farm brewery", "Craft brewery"
    specialties: ['IPA', 'Stout', 'Pilsner'], // e.g., ["IPA", "Sour beers", "Seasonal ales"]
  },
  
  /**
   * Location Details
   * - type, features, parking, accessibility
   */
  location: {
    type: 'Historic Yonder Farms', // e.g., "Historic barn", "Industrial space", "Farm location"
    features: ['Outdoor seating', 'Dog-friendly', 'Live music venue'], // e.g., ["Outdoor seating", "Dog-friendly", "Live music venue"]
    parking: 'Free parking available', // e.g., "Free parking available"
    accessibility: 'Wheelchair accessible', // e.g., "Wheelchair accessible"
  }
};

/**
 * =====================
 * Featured Beers (for homepage/marketing)
 * =====================
 */
export const featuredBeers: BeerInfo[] = [
  {
    name: 'Golden Wheat',
    description: 'Light and refreshing wheat beer with hints of citrus and coriander, perfect for any season.',
    category: 'wheat',
    status: 'on-tap'
  },
  {
    name: 'Bohemian Pilsner',
    description: 'Traditional Czech-style pilsner with noble Saaz hops, crisp malt character, and a clean, refreshing finish.',
    category: 'lager',
    status: 'on-tap'
  },
  {
    name: 'Berry Bliss Sour',
    description: 'Tart and refreshing sour ale with fresh blackberries, blueberries, and raspberries. Perfectly balanced sweet and sour.',
    category: 'sour',
    status: 'seasonal'
  }
];

/**
 * =====================
 * Food Menu Categories
 * =====================
 */
export const foodMenu: FoodInfo[] = [
  {
    name: '',
    description: '',
    category: 'appetizer',
    price: ''
  }
];

/**
 * =====================
 * Event Types Offered
 * =====================
 */
export const eventTypes: EventInfo[] = [
  {
    name: 'Live Music',
    description: 'Enjoy performances from local and regional musicians every month.',
    type: 'live-music'
  },
  {
    name: 'Trivia Night',
    description: 'Test your knowledge and win prizes at our weekly trivia nights.',
    type: 'trivia'
  },
  {
    name: 'Beer Tasting',
    description: 'Sample a curated flight of our latest and most popular brews.',
    type: 'tasting'
  },
  {
    name: 'Private Event',
    description: 'Book our space for your private parties, corporate events, or celebrations.',
    type: 'private-event'
  }
];

/**
 * =====================
 * Areas Served (for local SEO)
 * =====================
 */
export const areasServed = [
  { name: 'Albany', state: 'NY' },
  { name: 'Schenectady', state: 'NY' },
  { name: 'Troy', state: 'NY' },
  { name: 'Colonie', state: 'NY' },
  { name: 'Guilderland', state: 'NY' },
  { name: 'Latham', state: 'NY' },
  { name: 'Niskayuna', state: 'NY' },
  { name: 'Rotterdam', state: 'NY' },
  { name: 'Cohoes', state: 'NY' },
  { name: 'Watervliet', state: 'NY' },
  { name: 'Delmar', state: 'NY' },
  { name: 'Glenmont', state: 'NY' },
  { name: 'Menands', state: 'NY' },
  { name: 'Loudonville', state: 'NY' },
  { name: 'East Greenbush', state: 'NY' }
];

/**
 * =====================
 * SEO Data for Pages
 * =====================
 *
 * Contains SEO metadata for homepage, beer, food, events, about pages.
 */
export const seoData = {
  homepage: {
    title: 'Albany NY Craft Brewery | Broken Loop Brewing',
    description: 'Discover exceptional craft beers at Broken Loop Brewing in Albany, NY. From hoppy IPAs to rich stouts, experience traditional brewing with innovative flair.',
    keywords: 'craft beer, brewery, IPA, stout, wheat beer, Albany, New York, local brewery, beer tasting',
    canonicalUrl: 'https://brokenloopbrewing.com/',
    ogImage: 'https://brokenloopbrewing.com/images/og-image.jpg',
    lastModified: '2024-06-13'
  } as SEOData,
  
  beer: {
    title: 'Craft Beer Menu Albany NY | Broken Loop Brewing',
    description: 'Explore our rotating selection of craft beers on tap, featuring bold IPAs, rich stouts, refreshing wheat beers, and seasonal specialties.',
    keywords: 'on tap beers, craft beer selection, IPA, stout, wheat beer, beer menu, brewery taproom',
    canonicalUrl: 'https://brokenloopbrewing.com/beer',
    ogImage: 'https://brokenloopbrewing.com/images/beer-og-image.jpg',
    lastModified: '2024-06-13'
  } as SEOData,
  
  food: {
    title: 'Food Menu - Broken Loop Brewing',
    description: 'Discover our carefully crafted food menu designed to perfectly complement our craft beers. Local ingredients, bold flavors.',
    keywords: 'brewery food, pub food, food menu, beer pairings, local ingredients, brewery restaurant',
    canonicalUrl: 'https://brokenloopbrewing.com/food',
    ogImage: 'https://brokenloopbrewing.com/images/food-og-image.jpg',
    lastModified: '2024-06-13'
  } as SEOData,
  
  events: {
    title: 'Brewery Events Albany NY | Broken Loop Brewing',
    description: 'Join us for live music, trivia nights, beer tastings, and special events at Broken Loop Brewing. Check our calendar for upcoming events.',
    keywords: 'brewery events, live music, trivia, beer tasting, events calendar, local events',
    canonicalUrl: 'https://brokenloopbrewing.com/events',
    ogImage: 'https://brokenloopbrewing.com/images/events-og-image.jpg',
    lastModified: '2024-06-13'
  } as SEOData,
  
  about: {
    title: 'About Us - Broken Loop Brewing',
    description: 'Learn about Broken Loop Brewing\'s story, our commitment to quality craft beer, and our passion for community and tradition.',
    keywords: 'brewery story, craft beer history, brewery team, about us, local brewery, beer philosophy',
    canonicalUrl: 'https://brokenloopbrewing.com/about',
    ogImage: 'https://brokenloopbrewing.com/images/about-og-image.jpg',
    lastModified: '2024-06-13'
  } as SEOData
};

/**
 * =====================
 * Structured Data Generators
 * =====================
 *
 * - generateOrganizationSchema: Schema.org Brewery/Organization
 * - generateWebPageSchema: Schema.org WebPage
 * - generateFAQSchema: Schema.org FAQPage
 * - generateAllStructuredData: Bundles all schemas for a page
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Brewery",
    "@id": `${breweryInfo.website.baseUrl}/#organization`,
    "name": breweryInfo.name,
    "alternateName": breweryInfo.shortName,
    "url": breweryInfo.website.baseUrl,
    "logo": `${breweryInfo.website.baseUrl}/images/logo.png`,
    "image": `${breweryInfo.website.baseUrl}/images/brewery-exterior.jpg`,
    "description": breweryInfo.description,
    "telephone": breweryInfo.contact.phone.formatted,
    "email": breweryInfo.contact.email,
    "foundingDate": "2025",
    "founder": "Jonathan Golon",
    "acceptsReservations": false,
    "paymentAccepted": ["Cash", "Credit Card"],
    "currenciesAccepted": "USD",
    "hasMap": `https://maps.google.com/?q=${breweryInfo.address.coordinates.latitude},${breweryInfo.address.coordinates.longitude}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": breweryInfo.address.street,
      "addressLocality": breweryInfo.address.city,
      "addressRegion": breweryInfo.address.state,
      "postalCode": breweryInfo.address.zip,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": breweryInfo.address.coordinates.latitude,
      "longitude": breweryInfo.address.coordinates.longitude
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "15:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "15:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "12:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "12:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "$$",
    "servesCuisine": "American",
    "hasMenu": `${breweryInfo.website.baseUrl}/food`,
    "areaServed": areasServed.map(area => ({
      "@type": "City",
      "name": area.name,
      "containedInPlace": {
        "@type": "State",
        "name": area.state
      }
    })),
    "makesOffer": featuredBeers
      .filter(beer => beer.status === 'on-tap')
      .map(beer => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": beer.name,
          "description": beer.description,
          "category": "Alcoholic Beverage"
        }
      })),
    "sameAs": Object.values(breweryInfo.social).filter(Boolean)
  };
}

export function generateWebPageSchema(pageSEO: SEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageSEO.canonicalUrl}#webpage`,
    "url": pageSEO.canonicalUrl,
    "name": pageSEO.title,
    "description": pageSEO.description,
    "dateModified": pageSEO.lastModified,
    "inLanguage": "en-US",
    "isPartOf": {
      "@id": `${breweryInfo.website.baseUrl}/#website`
    },
    "about": {
      "@id": `${breweryInfo.website.baseUrl}/#organization`
    },
    "mainEntity": {
      "@type": "Brewery",
      "@id": `${breweryInfo.website.baseUrl}/#organization`
    }
  };
}

// FAQ schema for brewery-specific questions
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of beer do you brew?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${breweryInfo.name} specializes in ${breweryInfo.brewery.specialties.join(', ')}. We offer a rotating selection of ${featuredBeers.length}+ beers on tap including seasonal and limited releases.`
        }
      },
      {
        "@type": "Question",
        "name": "Do you serve food?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! We offer a full menu featuring ${foodMenu.map(item => item.category).join(', ')} made with locally sourced ingredients when possible.`
        }
      },
      {
        "@type": "Question",
        "name": "Can I bring my dog?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": breweryInfo.location.features.includes('Dog-friendly') 
            ? "Yes, we are dog-friendly! Well-behaved dogs are welcome in our taproom."
            : "Please contact us about our pet policy."
        }
      },
      {
        "@type": "Question",
        "name": "Do you host private events?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, we host private events including ${eventTypes.map(event => event.name.toLowerCase()).join(', ')}. Contact us at ${breweryInfo.contact.email} for availability and pricing.`
        }
      },
      {
        "@type": "Question",
        "name": "What are your hours?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our hours vary by season. For current hours, please call ${breweryInfo.contact.phone.formatted} or check our website. We're typically open ${breweryInfo.getCurrentStatus().isOpen ? 'now' : breweryInfo.getCurrentStatus().nextOpenDay}.`
        }
      },
      {
        "@type": "Question",
        "name": "Where are you located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${breweryInfo.name} is located at ${breweryInfo.address.full}. We offer ${breweryInfo.location.parking} and are ${breweryInfo.location.accessibility}.`
        }
      }
    ]
  };
}

/**
 * =====================
 * Policies FAQ Schema Generator (from InfoTabs)
 * =====================
 *
 * Generates a schema.org FAQPage object using the policies from the InfoTabs component.
 * Each policy is a question/answer pair.
 */
export function generatePoliciesFAQSchema() {
  // These must match the InfoTabs 'policies' tab (see InfoTabs.tsx)
  const policies = [
    {
      question: 'Are kids allowed?',
      answer: 'Families are welcome! We just ask that little ones stick with you and respect the space.'
    },
    {
      question: 'Can I bring my dog?',
      answer: 'Well-behaved pups are welcome in our outdoor spaces, but not inside the taproom.'
    },
    {
      question: 'Is there parking?',
      answer: 'We’ve got plenty of free on-site parking.'
    },
    {
      question: 'Do you offer beer flights?',
      answer: 'Not sure what to order? Build a custom flight and branch out with something new.'
    },
    {
      question: 'Do I need a reservation?',
      answer: 'All indoor and outdoor tables are open seating—no reservations needed.'
    },
    {
      question: 'Is there space inside?',
      answer: 'Plenty of room to spread out inside with a variety of seating options.'
    },
    {
      question: 'Do you have an outdoor patio?',
      answer: 'A comfortable spot to relax just outside the taproom—perfect for enjoying some fresh air.'
    },
    {
      question: 'Is there a beer garden?',
      answer: 'A wide-open space with lawn games and room to stretch out. Ideal for laid-back afternoons.'
    },
    {
      question: 'Can I bring outside food or drinks?',
      answer: 'We\'ve got everything you need right here.'
    },
    {
      question: 'When does the kitchen close?',
      answer: 'Our kitchen closes one hour before the brewery does, so don’t wait too long if you\'re hungry.'
    },
    {
      question: 'Can I get beer to-go?',
      answer: 'Cans available to take home.'
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": policies.map(policy => ({
      "@type": "Question",
      "name": policy.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": policy.answer
      }
    }))
  };
}

/**
 * Generate schema.org Event objects for the next N upcoming events
 */
export async function generateUpcomingEventSchema(limit: number = 3) {
  // Load pre-processed events data
  const response = await fetch('/data/events.json');
  const allEvents: Event[] = await response.json();
  const nextEvents = getNextUpcomingEvents(allEvents, limit);
  return nextEvents.map(event => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "startDate": event.date,
    "image": event.image,
    "description": event.brief_description,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Broken Loop Brewing",
      "address": breweryInfo.address.full
    },
    "organizer": {
      "@type": "Organization",
      "name": "Broken Loop Brewing"
    },
    "offers": {
      "@type": "Offer",
      "price": event.price,
      "availability": "https://schema.org/InStock"
    }
  }));
}

// Generate all structured data for a page
export async function generateAllStructuredData(pageSEO: SEOData) {
  const eventSchemas = await generateUpcomingEventSchema(3);
  return [
    generateOrganizationSchema(),
    generateWebPageSchema(pageSEO),
    generateFAQSchema(),
    ...eventSchemas
  ];
}

/**
 * =====================
 * SEO Data Helper (getSEOData)
 * =====================
 *
 * Returns SEOData object for a given route.
 */
export function getSEOData(route: string): SEOData {
  switch (route) {
    case '/':
      return seoData.homepage;
    case '/beer':
      return seoData.beer;
    case '/food':
      return seoData.food;
    case '/events':
      return seoData.events;
    case '/about':
      return seoData.about;
    default:
      return seoData.homepage;
  }
}

/**
 * =====================
 * Default Export
 * =====================
 */
export default breweryInfo;