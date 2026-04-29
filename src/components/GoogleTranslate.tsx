import { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    // Add Google Translate Script
    const addScript = document.createElement('script');
    addScript.setAttribute(
      'src',
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    );
    addScript.setAttribute('id', 'google-translate-script');
    document.body.appendChild(addScript);

    // Initialization function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,kn,ta', // English, Kannada, Tamil
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    return () => {
      // Cleanup script when component unmounts (leaving landing page)
      const script = document.getElementById('google-translate-script');
      if (script) {
        document.body.removeChild(script);
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ display: 'none' }} // Hide the default widget
    ></div>
  );
};

export default GoogleTranslate;

// Type declaration for window object
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
