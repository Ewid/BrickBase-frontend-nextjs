import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex justify-center">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <div className="flex flex-col gap-6 px-5 py-10 text-center @container">
          <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
            <Link href="/terms" className="text-[#93adc8] text-base font-normal leading-normal min-w-40">Terms of service</Link>
            <Link href="/privacy" className="text-[#93adc8] text-base font-normal leading-normal min-w-40">Privacy policy</Link>
            <Link href="/risk" className="text-[#93adc8] text-base font-normal leading-normal min-w-40">Risk disclosure</Link>
            <Link href="/faq" className="text-[#93adc8] text-base font-normal leading-normal min-w-40">FAQ</Link>
          </div>
          <p className="text-[#93adc8] text-base font-normal leading-normal">© 2025 BrickBase. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
