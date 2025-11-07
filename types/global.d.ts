import 'react';

interface Window {
  ethereum?: any;
  coinbaseWalletExtension?: any;
  phantom?: {
    ethereum?: any;
  };
  __VMF_BUY_MODAL_DEBUG__?: {
    setStep: (step: 'buy' | 'donate' | 'verify' | 'success') => void;
    setHashes: (hashes: { donationTx?: string; vmfTx?: string }) => void;
    reset: () => void;
  };
}

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
    phantom?: {
      ethereum?: any;
    };
    __VMF_BUY_MODAL_DEBUG__?: {
      setStep: (step: 'buy' | 'donate' | 'verify' | 'success') => void;
      setHashes: (hashes: { donationTx?: string; vmfTx?: string }) => void;
      reset: () => void;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       */
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {}; 
