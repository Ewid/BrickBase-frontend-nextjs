import MainLayout from '@/components/layout/MainLayout';
import HeroBanner from '@/components/layout/HeroBanner';
import PropertyList from '@/components/property/PropertyList';
import CryptoBuySteps from '@/components/web3/CryptoBuySteps';
import { propertyService } from '@/services/propertyService';

export default async function Home() {
  // Fetch data from our services
  const featuredProperties = await propertyService.getFeaturedProperties();

  return (
    <MainLayout>
      <HeroBanner
        title="Own the future of Real Estate with BrickBase"
        subtitle="Experience the future of real estate with NFTs and blockchain technology"
        backgroundImage="https://cdn.usegalileo.ai/sdxl10/467bffaa-4164-4416-b906-e619d638dd15.png"
        searchPlaceholder="Search by city, neighborhood, address"
      />
      
      <PropertyList 
        title="Featured properties" 
        properties={featuredProperties} 
        showInfoCards={true}
      />
      
      <CryptoBuySteps 
        title="How to buy with crypto"
        showStartButton={true}
        showDetailedSteps={false}
      />
    </MainLayout>
  );
}
