// Strapi Response Wrapper
export interface StrapiData<T> {
  id: number;
  attributes: T;
}

// Navigation Item
export interface NavigationItem {
  label: string;
  href: string;
  order: number;
}

// CTA Button
export interface CtaButton {
  text: string;
  href?: string;
  variant: 'primary' | 'secondary' | 'outline';
  isVisible: boolean;
  location: 'navigation' | 'hero' | 'footer' | 'other';
  order: number;
  opensContactForm?: boolean;
}

// Hero Section
export interface HeroSection {
  title: string;
  highlightedText: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  certifiedPartners: Array<{
    name: string;
    logo?: string;
  }>;
}

// Icon type for Strapi IconHub
export interface StrapiIcon {
  iconName?: string;
  iconData?: string;
  width?: number;
  height?: number;
  isSvgEditable?: boolean;
  isIconNameEditable?: boolean;
}

// Tool
export interface Tool {
  Name: string;
  Logo?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

// Service
export interface Service {
  title: string;
  description: string;
  icon: StrapiIcon | string | null;
  keyTools?: Tool[];
  link?: string;
  linkText: string;
  color: 'accent' | 'secondary';
  order: number;
}

// Value Proposition
export interface ValueProposition {
  title: string;
  description: string;
  icon: StrapiIcon | string | null;
  order: number;
}

// Case Study
export interface CaseStudy {
  title: string;
  subtitle?: string;
  description: string;
  results: Array<{
    metric: string;
    value: string;
  }>;
  icon: StrapiIcon | string | null;
  featured: boolean;
  buttonText: string;
}

// Testimonial
export interface Testimonial {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorInitials?: string;
  rating: number;
  featured: boolean;
}

// Metric
export interface Metric {
  value: string;
  label: string;
  order: number;
}

// Partner
export interface Partner {
  name: string;
  logo?: string;
  order: number;
}

// Process Step
export interface ProcessStep {
  title: string;
  description: string;
  icon?: StrapiIcon | string | null;
  stepNumber?: number;
  order: number;
}

// Blog Post
export interface BlogPost {
  title: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
}

// CTA Section
export interface CtaSection {
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  phoneText?: string;
  confidentialityText?: string;
}

// Footer
export interface Footer {
  links?: any;
  companyDescription?: string;
  socialLinks?: any;
  copyright?: string;
}

// Solution
export interface Solution {
  title: string;
  subtitle?: string;
  slug: string;
  shortDescription?: string;
  service?: Service & { id: number };
  icon: StrapiIcon | string | null;
  featured: boolean;
  order: number;

  // Key Tools (matches backend schema)
  keyTools?: Tool[];

  // Project details
  project?: {
    projectName: string;
    clientInfo?: string;

    // Problem section
    problemTitle?: string;
    problemDescription?: string;
    problemPoints?: Array<{
      emoji?: string;
      text: string;
    }>;

    // Solution section
    solutionTitle?: string;
    solutionDescription?: string;
    solutionSteps?: Array<{
      emoji?: string;
      text: string;
    }>;

    // Results section
    resultsTitle?: string;
    results?: Array<{
      emoji?: string;
      metric: string;
      value: string;
    }>;

    // Metrics comparison
    beforeMetrics?: Array<{
      label: string;
      value: string;
    }>;
    afterMetrics?: Array<{
      label: string;
      value: string;
    }>;

    savings?: string;
  };

  // Hero CTA customization
  heroCTA?: {
    primaryButtonText?: string;
    secondaryButtonText?: string;
  };

  // Technologies section
  technologiesSection?: {
    title?: string;
    description?: string;
  };

  // Before/After section
  beforeAfterSection?: {
    title?: string;
    description?: string;
  };

  // FAQs
  faqs?: Array<{
    question: string;
    answer: string;
    order?: number;
  }>;

  // Final CTA section
  finalCTA?: {
    title?: string;
    description?: string;
    options?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    contactPhone?: string;
    contactEmail?: string;
    guarantees?: string;
  };

  // Related solutions teaser
  relatedSolutionsSection?: {
    title?: string;
    description?: string;
  };

  // Visual suggestions
  visuals?: Array<{
    type: string;
    description: string;
  }>;
}

// Contact Form Content (from Strapi)
export interface ContactFormContent {
  title: string;
  description?: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButtonText: string;
  privacyPolicyText?: string;
  privacyPolicyUrl?: string;
  termsText?: string;
  termsUrl?: string;
  privacyAgreementText?: string;
  successMessage: string;
}

// Contact Form Submission
export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
}

// Contact Submission (from Strapi)
export interface ContactSubmission {
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

// Page (for static pages like Privacy, Terms)
export interface Page {
  title: string;
  slug: string;
  content: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
}

// About Us - Stat Card
export interface AboutUsStatCard {
  icon?: string;
  value: string;
  label: string;
  order: number;
}

// About Us - Content Card
export interface AboutUsContentCard {
  icon?: string;
  title: string;
  description: string;
  order: number;
}

// About Us - Content Section
export interface AboutUsContentSection {
  sectionTitle: string;
  sectionType: 'text' | 'cards' | 'badges';
  description?: string;
  cards?: AboutUsContentCard[];
  order: number;
}

// About Us - Hero Section
export interface AboutUsHeroSection {
  title: string;
  subtitle: string;
  badgeText?: string;
  stats?: AboutUsStatCard[];
}

// About Us - Main Type
export interface AboutUs {
  heroSection: AboutUsHeroSection;
  sections?: AboutUsContentSection[];
}

// ========================================
// WhatsApp Business API Types
// ========================================

/**
 * WhatsApp message structure from Meta webhook
 */
export interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
}

/**
 * Parsed WhatsApp message for internal use
 */
export interface ParsedWhatsAppMessage {
  from: string;
  messageId: string;
  message: string;
  timestamp: Date;
  type: string;
}

/**
 * WhatsApp message stored in Strapi
 */
export interface WhatsAppMessage {
  from: string;
  message: string;
  messageId: string;
  timestamp: string;
  status: 'received' | 'replied';
  reply?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
