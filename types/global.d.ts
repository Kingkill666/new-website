import 'react';

interface Window {
  ethereum?: any;
  coinbaseWalletExtension?: any;
  phantom?: {
    ethereum?: any;
  };
}

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
    phantom?: {
      ethereum?: any;
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