declare namespace JSX {
    interface IntrinsicElements {
      // Old web3modal button
      // "w3m-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      // New Reown AppKit button (from docs)
      "appkit-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      // Add other custom elements here if needed, e.g.:
      // "w3m-network-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  } 