import Image from 'next/image';

interface PropertyCardProps {
  imageUrl: string;
  price: string;
  beds: number;
  baths: number;
  sqft?: number;
  address: string;
  city?: string;
  isNFT?: boolean;
  listingDate?: string;
}

export default function PropertyCard({
  imageUrl,
  price,
  beds,
  baths,
  sqft,
  address,
  city,
  isNFT = false,
  listingDate
}: PropertyCardProps) {
  return (
    <div className="flex flex-col gap-3 pb-3">
      {imageUrl && (
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        ></div>
      )}
      <div>
        <p className="text-white text-base font-medium leading-normal">{price}</p>
        <p className="text-[#93adc8] text-sm font-normal leading-normal">
          {beds} bed{beds !== 1 ? 's' : ''}, {baths} bath{baths !== 1 ? 's' : ''}
          {sqft && `, ${sqft} sqft`}
        </p>
        <p className="text-[#93adc8] text-sm font-normal leading-normal">
          {address}
          {city && `, ${city}`}
        </p>
      </div>
    </div>
  );
}

export function PropertyInfoCard({
  city,
  isNFT = false,
  listingDate
}: Pick<PropertyCardProps, 'city' | 'isNFT' | 'listingDate'>) {
  return (
    <div className="flex flex-col gap-3 pb-3">
      <div>
        <p className="text-white text-base font-medium leading-normal">{city}</p>
        {isNFT && <p className="text-[#93adc8] text-sm font-normal leading-normal">NFT</p>}
        {listingDate && (
          <p className="text-[#93adc8] text-sm font-normal leading-normal">Listed {listingDate}</p>
        )}
      </div>
    </div>
  );
}
