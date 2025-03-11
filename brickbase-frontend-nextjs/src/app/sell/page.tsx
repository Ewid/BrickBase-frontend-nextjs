import MainLayout from '@/components/layout/MainLayout';

export default function SellPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 items-center justify-center py-12">
        <h1 className="text-white text-4xl font-bold">Sell Your Property as NFT</h1>
        <p className="text-[#93adc8] text-lg text-center max-w-2xl">
          List your property on BrickBase and sell it as an NFT. Coming soon.
        </p>
      </div>
    </MainLayout>
  );
} 