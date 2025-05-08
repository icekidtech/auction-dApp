"use client";

import { useEffect } from "react";

export function UIReset() {
  useEffect(() => {
    // Force a style recalculation by adding and removing a class
    document.body.classList.add('ui-reset');
    
    // Clean up any stray modals or overlays
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });
    
    return () => {
      document.body.classList.remove('ui-reset');
    };
  }, []);
  
  return null;
}