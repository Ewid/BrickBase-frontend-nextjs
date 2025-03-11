import React from 'react';
import PropertyCard, { PropertyInfoCard } from './PropertyCard';

interface PropertyData {
  id: string;
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

interface PropertyListProps {
  title: string;
  properties: PropertyData[];
  showInfoCards?: boolean;
}

export default function PropertyList({ title, properties, showInfoCards = false }: PropertyListProps) {
  return (
    <>
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {properties.map((property) => (
          <React.Fragment key={property.id}>
            <PropertyCard
              imageUrl={property.imageUrl}
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              sqft={property.sqft}
              address={property.address}
              city={property.city}
            />
            {showInfoCards && (
              <PropertyInfoCard
                city={property.city}
                isNFT={property.isNFT}
                listingDate={property.listingDate}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export function NFTList({ title, nfts }: { title: string; nfts: { id: string; imageUrl: string }[] }) {
  return (
    <>
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {nfts.map((nft) => (
          <div key={nft.id} className="flex flex-col gap-3">
            <div
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
              style={{ backgroundImage: `url("${nft.imageUrl}")` }}
            ></div>
          </div>
        ))}
      </div>
    </>
  );
}
