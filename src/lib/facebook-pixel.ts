declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface FacebookPixelEvent {
  event: string;
  parameters?: Record<string, any>;
}

class FacebookPixelService {
  private initialized = false;
  private pixelId: string | null = null;

  init(pixelId: string) {
    if (this.initialized || !pixelId) return;
    
    this.pixelId = pixelId;
    
    // Initialize Facebook Pixel using the native fbq function
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('init', pixelId);
      this.initialized = true;
      console.log('Facebook Pixel initialized with ID:', pixelId);
    } else {
      // Load the Facebook Pixel script
      this.loadPixelScript(pixelId);
    }
  }

  private loadPixelScript(pixelId: string) {
    if (typeof window === 'undefined') return;

    // Create the fbq function if it doesn't exist (standard Meta pixel initialization)
    const n = window as any;
    if (n.fbq) return;
    
    const fbq: any = n.fbq = function() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };
    
    if (!n._fbq) n._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    // Load the pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    // Initialize after script loads
    window.fbq('init', pixelId);
    this.initialized = true;
    console.log('Facebook Pixel script loaded and initialized with ID:', pixelId);
  }

  pageView() {
    if (!this.initialized || typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', 'PageView');
  }

  track(event: string, parameters?: Record<string, any>, eventId?: string) {
    if (!this.initialized || typeof window === 'undefined' || !window.fbq) return;
    
    if (eventId) {
      window.fbq('track', event, parameters || {}, { eventID: eventId });
    } else {
      window.fbq('track', event, parameters || {});
    }
  }

  // E-commerce specific events
  viewContent(parameters: {
    content_ids: string[];
    content_type: string;
    value?: number;
    currency?: string;
  }, eventId?: string) {
    this.track('ViewContent', parameters, eventId);
  }

  addToCart(parameters: {
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
  }, eventId?: string) {
    this.track('AddToCart', parameters, eventId);
  }

  initiateCheckout(parameters: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
  }, eventId?: string) {
    this.track('InitiateCheckout', parameters, eventId);
  }

  purchase(parameters: {
    content_ids: string[];
    value: number;
    currency: string;
    content_type: string;
  }, eventId?: string) {
    this.track('Purchase', parameters, eventId);
  }

  search(parameters: {
    search_string: string;
    content_ids?: string[];
  }, eventId?: string) {
    this.track('Search', parameters, eventId);
  }
}

export const facebookPixel = new FacebookPixelService();
