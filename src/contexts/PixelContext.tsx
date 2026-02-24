import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { facebookPixel } from '@/lib/facebook-pixel';
import { tracking } from '@/lib/tracking-utils';

interface PixelContextType {
  pixelId: string | null;
  fbp: string | null;
  fbc: string | null;
  loading: boolean;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export function PixelProvider({ children }: { children: React.ReactNode }) {
  const { metaPixelId, isLoading } = useSettings();
  const [fbp, setFbp] = useState<string | null>(null);
  const [fbc, setFbc] = useState<string | null>(null);

  // Capture Meta cookies on mount and when URL changes (fbc comes from click)
  useEffect(() => {
    const captureCookies = () => {
      setFbp(getCookie('_fbp'));
      setFbc(getCookie('_fbc'));
    };

    captureCookies();

    // Also check for fbc in URL params (fbclid)
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid && !getCookie('_fbc')) {
      // fbc format: fb.1.timestamp.fbclid
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
      setFbc(fbcValue);
    }
  }, []);

  // Initialize pixel and update tracking utility when pixel data is available
  useEffect(() => {
    if (metaPixelId && !isLoading) {
      facebookPixel.init(metaPixelId);
      facebookPixel.pageView();
    }

    // Update tracking utility with pixel data
    tracking.setPixelData(metaPixelId, fbp, fbc);
  }, [metaPixelId, isLoading, fbp, fbc]);

  return (
    <PixelContext.Provider value={{ pixelId: metaPixelId, fbp, fbc, loading: isLoading }}>
      {children}
    </PixelContext.Provider>
  );
}

export function usePixel() {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
}
