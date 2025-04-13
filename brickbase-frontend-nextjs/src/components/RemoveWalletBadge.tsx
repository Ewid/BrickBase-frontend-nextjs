'use client';

import { useEffect } from 'react';

/**
 * This component removes the ReOwn wallet badge from the page
 * It uses a mutation observer to detect when the badge is added to the DOM
 */
export default function RemoveWalletBadge() {
  useEffect(() => {
    // Function to remove wallet badge elements
    const removeWalletBadge = () => {
      // Only target elements that are likely the wallet badge at the bottom
      // Look for elements that are at the bottom of the page and not in the navbar
      
      const bodyElement = document.body;
      if (!bodyElement) return;
      
      // Look specifically for the wallet display at the bottom of the page
      const walletElements = document.querySelectorAll('.text-crypto-light');
      
      walletElements.forEach(element => {
        // Check if it contains the specific address
        if (element.textContent?.includes('0xa831')) {
          // Find the parent container
          let parent = element.parentElement;
          while (parent && !parent.classList.contains('flex')) {
            parent = parent.parentElement;
          }
          
          // Make sure this is not inside the navbar
          if (parent && !isInsideNavbar(parent)) {
            // Check if this element is in the bottom portion of the page
            const rect = parent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If this element is in the bottom third of the page, it's likely the badge we want to hide
            if (rect.top > viewportHeight * 0.7) {
              parent.setAttribute('style', 'display: none !important');
            }
          }
        }
      });
      
      // Look for the wallet badge with logout button in the bottom part of the page
      document.querySelectorAll('.flex.items-center.gap-2').forEach(element => {
        const hasLogoutButton = element.querySelector('svg.lucide-log-out');
        
        if (hasLogoutButton && !isInsideNavbar(element)) {
          // Check position to make sure it's at the bottom
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // If this element is in the bottom third of the page, hide it
          if (rect.top > viewportHeight * 0.7) {
            element.setAttribute('style', 'display: none !important');
          }
        }
      });
    };
    
    // Helper function to check if an element is inside the navbar
    const isInsideNavbar = (element: Element): boolean => {
      let current = element;
      // Check if this element or any of its parents is the navbar
      while (current) {
        if (
          current.tagName === 'NAV' || 
          current.classList.contains('navbar') ||
          current.classList.contains('glass-card') // Class used on navbar
        ) {
          return true;
        }
        if (!current.parentElement) break;
        current = current.parentElement;
      }
      return false;
    };

    // Wait for the page to fully load
    if (document.readyState === 'complete') {
      removeWalletBadge();
    } else {
      window.addEventListener('load', removeWalletBadge);
    }
    
    // Set up a mutation observer to detect when the wallet badge is added
    const observer = new MutationObserver(() => {
      removeWalletBadge();
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Clean up the observer when the component unmounts
    return () => {
      window.removeEventListener('load', removeWalletBadge);
      observer.disconnect();
    };
  }, []);
  
  return null; // This component doesn't render anything
} 