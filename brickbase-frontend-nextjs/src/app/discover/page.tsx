import MainLayout from '@/components/layout/MainLayout';
import HeroBanner from '@/components/layout/HeroBanner';
import PropertyList from '@/components/property/PropertyList';
import { NFTList } from '@/components/property/PropertyList';
import CryptoBuySteps from '@/components/web3/CryptoBuySteps';
import { propertyService } from '@/services/propertyService';

export default async function DiscoverPage() {
  // Fetch data from our services
  const recentProperties = await propertyService.getRecentProperties();
  const featuredNFTs = await propertyService.getFeaturedNFTs();

  return (
    <MainLayout>
      <HeroBanner
        title="Welcome to the Future"
        backgroundImage="https://cdn.usegalileo.ai/sdxl10/5ae8c71f-6a54-4a5c-91c7-f2b0a6c56f9e.png"
        searchPlaceholder="Search for a property or city"
        variant="centered"
      />
      
      <PropertyList 
        title="Recently listed" 
        properties={recentProperties} 
      />
      
      <NFTList 
        title="Featured NFTs" 
        nfts={featuredNFTs} 
      />
      
      <CryptoBuySteps 
        title="How to buy with crypto"
        showStartButton={false}
        showDetailedSteps={true}
      />
    </MainLayout>
  );
} 