import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not already installed
      if (!standalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install prompt if on iOS and not standalone
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isStandalone || sessionStorage.getItem('installPromptDismissed') || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            {isIOS ? <Smartphone className="h-6 w-6 text-white" /> : <Download className="h-6 w-6 text-white" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Install InsureTrack</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {isIOS 
                ? "Add InsureTrack to your home screen for quick access. Tap the share button and select 'Add to Home Screen'."
                : "Install InsureTrack as an app for faster access and offline functionality."
              }
            </p>
            
            <div className="flex gap-3">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm"
                >
                  <Download className="h-4 w-4" />
                  Install
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-semibold text-sm"
              >
                <X className="h-4 w-4" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
        
        {isIOS && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Monitor className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">iOS Installation Steps:</span>
            </div>
            <ol className="mt-2 text-xs text-blue-700 space-y-1 ml-6">
              <li>1. Tap the Share button (square with arrow)</li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" to confirm</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;