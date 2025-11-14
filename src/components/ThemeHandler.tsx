
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ThemeHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const applyTheme = () => {
      const onboardingDataRaw = localStorage.getItem('onboardingData');
      if (onboardingDataRaw) {
        try {
          const onboardingData = JSON.parse(onboardingDataRaw);
          const themeName = (onboardingData.theme || 'Minimal Retail').toLowerCase().replace(/\s+/g, '-');
          document.documentElement.className = `light theme-${themeName}`;
        } catch (error) {
          console.error("Failed to parse onboarding data:", error);
          document.documentElement.className = 'light';
        }
      } else {
        document.documentElement.className = 'light';
      }
    };

    applyTheme();

    const loggedInUser = localStorage.getItem('loggedInUserId');
    if (!loggedInUser && pathname === '/get-started') {
      router.push('/signup');
    }

    // Set up an event listener to re-apply the theme if it changes during the session
    window.addEventListener('theme-changed', applyTheme);
    return () => {
      window.removeEventListener('theme-changed', applyTheme);
    };
  }, [pathname, router]);

  return null; // This component does not render anything
}
