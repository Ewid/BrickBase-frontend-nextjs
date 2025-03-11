import MainLayout from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 items-center justify-center py-12">
        <h1 className="text-white text-4xl font-bold">About BrickBase</h1>
        <p className="text-[#93adc8] text-lg text-center max-w-2xl">
          BrickBase is revolutionizing real estate with blockchain technology, making property ownership more accessible, transparent, and liquid.
        </p>
      </div>
    </MainLayout>
  );
} 