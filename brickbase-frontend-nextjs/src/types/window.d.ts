// This ensures TypeScript knows window.ethereum exists, but we will cast it to any when using it
// to avoid errors with Record<string, unknown>
declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}

export {}; 