'use client';

interface StepCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  stepNumber?: number;
}

function StepCard({ title, description, icon, stepNumber }: StepCardProps) {
  return (
    <div className="flex flex-1 gap-3 rounded-lg border border-[#344d65] bg-[#1a2632] p-4 flex-col">
      <div className="text-white">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-white text-base font-bold leading-tight">
          {stepNumber ? `Step ${stepNumber}: ${title}` : title}
        </h2>
        {description && (
          <p className="text-[#93adc8] text-sm font-normal leading-normal">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function CryptoBuySteps({ 
  title = "How to buy with crypto",
  showStartButton = true,
  showDetailedSteps = false
}) {
  // Icons for the steps
  const lockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
      <path
        d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"
      ></path>
    </svg>
  );

  const lockOpenIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
      <path
        d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"
      ></path>
    </svg>
  );

  // Basic steps
  const basicSteps = [
    { title: "Secure your wallet", icon: lockIcon },
    { title: "Link your wallet", icon: lockOpenIcon },
    { title: "Sign the transaction", icon: lockOpenIcon },
  ];

  // Detailed steps
  const detailedSteps = [
    { 
      title: "Secure your wallet", 
      description: "Choose a wallet that supports Web3 and keep your private key safe.",
      icon: lockIcon,
      stepNumber: 1
    },
    { 
      title: "Find a property", 
      description: "Discover properties on BrickBase and make an offer. If your offer is accepted, you'll receive a notification.",
      icon: lockOpenIcon,
      stepNumber: 2
    },
    { 
      title: "Make an offer", 
      description: "When you're ready to buy, send cryptocurrency to the address provided.",
      icon: lockIcon,
      stepNumber: 3
    },
    { 
      title: "Close the deal", 
      description: "Once your payment is confirmed, you'll receive the property title and keys to the home.",
      icon: lockOpenIcon,
      stepNumber: 4
    },
  ];

  const steps = showDetailedSteps ? detailedSteps : basicSteps;

  return (
    <>
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {steps.map((step, index) => (
          <StepCard 
            key={index}
            title={step.title}
            description={step.description}
            icon={step.icon}
            stepNumber={step.stepNumber}
          />
        ))}
      </div>
      {showStartButton && (
        <div className="flex px-4 py-3 justify-start">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Start buying</span>
          </button>
        </div>
      )}
    </>
  );
} 