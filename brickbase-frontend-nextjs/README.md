# BrickBase Frontend

A modern Next.js frontend for the BrickBase platform, which allows users to browse, buy, and sell real estate properties as NFTs using blockchain technology.

## Features

- Modern dark-themed UI inspired by Web3 applications
- Property listings with NFT support
- Responsive design optimized for all device sizes
- Search functionality for properties
- "How to buy with crypto" guides
- Featured properties and NFTs
- Clean, component-based architecture

## Tech Stack

- **Next.js 15**: For server-side rendering and routing
- **React 19**: For UI components
- **TypeScript**: For type safety
- **TailwindCSS**: For styling
- **Ethers.js / wagmi**: For Web3 integration (placeholders for future implementation)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/BrickBase-frontend-nextjs.git
   ```

2. Navigate to the project directory:
   ```bash
   cd BrickBase-frontend-nextjs
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   │   ├── common/          # Common UI components
│   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   ├── property/        # Property-related components
│   │   └── web3/            # Web3/blockchain-related components
│   ├── services/            # API services
│   ├── store/               # State management
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
```

## Pages

- **Home**: Landing page with featured properties
- **Discover**: Browse all properties and NFTs
- **Invest**: Investment opportunities (placeholder)
- **Sell**: List properties for sale (placeholder)
- **About**: About BrickBase (placeholder)
- **Help**: Help and support (placeholder)

## Future Improvements

- Implement full Web3 functionality with wallet connection
- Add property detail pages
- Create user profiles and dashboards
- Add favorites and saved searches
- Implement notifications for property status changes
- Add marketplace functionality for buying and selling

## License

[MIT](LICENSE)
