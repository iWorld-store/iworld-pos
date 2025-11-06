'use client';

import { useEffect } from 'react';

// Register service worker for PWA
export default function SWRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister any existing service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
        
        // Clear all caches
        if ('caches' in window) {
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          });
        }
        
        // Wait a bit, then register new service worker
        setTimeout(() => {
      navigator.serviceWorker
            .register('/sw.js?v=4', { scope: '/' })
        .then((registration) => {
              // Check for updates immediately
              registration.update();
              
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker registered:', registration);
          }
        })
        .catch((error) => {
          // Silently handle errors - app works without service worker
          if (process.env.NODE_ENV === 'development') {
            console.warn('Service Worker registration failed:', error);
          }
            });
        }, 100);
        });
    }
  }, []);

  return null;
}
