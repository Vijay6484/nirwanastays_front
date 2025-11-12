// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-3MD97DC8HQ', {
      page_path: window.location.pathname,
    });
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-3MD97DC8HQ', {
      page_path: path,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('click', 'button', `${buttonName}${location ? ` - ${location}` : ''}`);
};

// Track navigation clicks
export const trackNavigation = (destination: string) => {
  trackEvent('navigation', 'menu', destination);
};

// Track booking-related events
export const trackBookingEvent = (action: string, details?: string) => {
  trackEvent(action, 'booking', details);
};

// Track accommodation selection
export const trackAccommodationSelect = (accommodationId: string, accommodationName: string) => {
  trackEvent('select_item', 'accommodation', `${accommodationName} (${accommodationId})`);
};

// Track form interactions
export const trackFormInteraction = (formName: string, action: string) => {
  trackEvent(action, 'form', formName);
};

// Track phone calls
export const trackPhoneCall = (phoneNumber: string) => {
  trackEvent('phone_call', 'contact', phoneNumber);
};

// Track WhatsApp clicks
export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', 'contact', 'WhatsApp Button');
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText?: string) => {
  trackEvent('external_link', 'outbound', linkText || url);
};

// Track scroll depth (optional, can be added later)
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll', 'engagement', `${depth}%`);
};

