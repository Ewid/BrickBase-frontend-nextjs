import MainLayout from '@/components/layout/MainLayout';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 items-center justify-center py-12">
        <h1 className="text-white text-4xl font-bold">Help & Support</h1>
        <p className="text-[#93adc8] text-lg text-center max-w-2xl">
          Find answers to common questions about using BrickBase. Our support team is here to help.
        </p>
        
        <div className="flex flex-col gap-4 mt-6 max-w-2xl w-full">
          <div className="border border-[#344d65] bg-[#1a2632] p-4 rounded-lg">
            <h3 className="text-white text-xl font-bold mb-2">What is an NFT property?</h3>
            <p className="text-[#93adc8]">An NFT property is a real estate asset that has been tokenized on the blockchain, providing transparent ownership and easier transfers.</p>
          </div>
          
          <div className="border border-[#344d65] bg-[#1a2632] p-4 rounded-lg">
            <h3 className="text-white text-xl font-bold mb-2">How do I buy a property with crypto?</h3>
            <p className="text-[#93adc8]">Check out our step-by-step guide on the home page or discover page to learn how to purchase properties using cryptocurrency.</p>
          </div>
          
          <div className="border border-[#344d65] bg-[#1a2632] p-4 rounded-lg">
            <h3 className="text-white text-xl font-bold mb-2">Is my investment secure?</h3>
            <p className="text-[#93adc8]">BrickBase uses advanced blockchain technology to ensure secure transactions and verify property ownership.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 