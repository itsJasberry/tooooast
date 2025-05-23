"use client";
import React, { useState } from "react";
import { Check, ArrowRight, CircleCheck } from "lucide-react";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Define types for our pricing data
type Feature = {
  text: string;
};

type PricingTier = {
  title: string;
  price: number;
  features: Feature[];
  popular?: boolean;
  variant: "basic" | "premium" | "app";
};

// Pricing data
const pricingData: PricingTier[] = [
  {
    title: "Basic",
    price: 39.9,
    features: [
      { text: "Email Support" },
      { text: "Documentation Access" },
      { text: "Basic Analytics" },
      { text: "1 User Account" },
    ],
    variant: "basic",
  },
  {
    title: "Premium",
    price: 99.9,
    features: [
      { text: "Priority Support" },
      { text: "Advanced Analytics" },
      { text: "Custom Integrations" },
      { text: "Team Collaboration" },
      { text: "API Access" },
      { text: "Dedicated Account Manager" },
      { text: "Training Sessions" },
      { text: "Unlimited Storage" },
    ],
    popular: true,
    variant: "premium",
  },
  {
    title: "App",
    price: 149.9,
    features: [
      { text: "Enterprise Support" },
      { text: "White-label Solution" },
      { text: "Custom Development" },
      { text: "SLA Guarantee" },
    ],
    variant: "app",
  },
];

// PricingCard component for individual pricing tiers
const PricingCard: React.FC<{ tier: PricingTier; onClick: () => void }> = ({
  tier,
  onClick,
}) => {
  // Determine styling based on variant
  const getCardStyles = () => {
    switch (tier.variant) {
      case "basic":
        return {
          container:
            "pt-16 bg-[rgb(245,245,245)] px-8 pb-8 rounded-2xl flex flex-col gap-8",
          divider: "h-[2px] bg-[rgb(235,235,235)]",
          icon: <Check className="text-gray-400 size-5" />,
          button:
            "bg-black rounded-full px-3.5 py-2 text-white hover:cursor-pointer",
        };
      case "premium":
        return {
          container:
            "pt-16 bg-[rgb(26,25,25)] px-10 pb-8 rounded-2xl flex flex-col gap-8 text-gray-100 bg-gradient-to-r p-0.5 hover:shadow-glow min-w-[520px] relative",
          divider: "h-[2px] bg-[rgba(215,215,215,0.16)]",
          icon: <CircleCheck className="text-black fill-gray-100 size-5" />,
          button:
            "pink-gradient rounded-full px-3.5 py-2 text-black hover:cursor-pointer",
          style: { transition: "box-shadow 0.5s ease" },
        };
      case "app":
        return {
          container:
            "pt-16 pink-gradient px-8 pb-8 rounded-2xl flex flex-col gap-8",
          divider: "h-[2px] bg-[rgba(15,15,15,0.13)]",
          icon: <Check className="text-gray-400 size-5" />,
          button:
            "bg-black rounded-full px-3.5 py-2 text-white hover:cursor-pointer",
        };
      default:
        return {
          container: "",
          divider: "",
          icon: <Check className="text-gray-400 size-5" />,
          button: "",
        };
    }
  };

  const styles = getCardStyles();

  // Format price with proper currency notation
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div
      className={`${styles.container} min-w-[300px] flex-1`}
      style={styles.style}
      role="article"
      aria-label={`${tier.title} pricing plan`}>
      {tier.popular && (
        <div className="py-1 px-2 text-xs border border-gray-100 max-w-fit rounded-full absolute top-[25px] left-[35px]">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold">{tier.title}</h3>
      <div className={styles.divider} />
      <ul
        className={`flex flex-col gap-4 ${
          tier.variant === "premium" ? "flex-wrap max-h-[150px] gap-x-8" : ""
        }`}
        aria-label={`${tier.title} plan features`}>
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            {styles.icon}
            {feature.text}
          </li>
        ))}
      </ul>
      <div className={styles.divider} />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="font-bold">{formatPrice(tier.price)}</span>{" "}
          <span className="text-gray-400"> / month</span>
        </div>
        <button
          className={styles.button}
          aria-label={`Start ${tier.title} plan`}
          onClick={onClick}>
          Start now <ArrowRight className="inline-block" />
        </button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [showPopup, setShowPopup] = useState(false);

  // Funkcja otwierająca formularz (dialog)
  const handleOpenForm = () => {
    setShowPopup(true);
  };

  return (
    <section
      className="w-full bg-white"
      id="pricing"
      aria-labelledby="pricing-heading">
      {/* Skrypt GoHighLevel */}
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />

      {/* Pozostała część komponentu */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20">
        <h2 id="pricing-heading" className="sr-only">
          Pricing Plans
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {pricingData.map((tier, index) => (
            <PricingCard key={index} tier={tier} onClick={handleOpenForm} />
          ))}
        </div>
      </div>

      {/* Dialog z inline iframe */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-fit max-h-[600px] overflow-scroll overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Formularz</DialogTitle>
          </DialogHeader>

          <iframe
            src="https://api.leadconnectorhq.com/widget/form/djLZrZMTFRPjUsorhPeK"
            style={{
              width: "100%",
              height: "600px",
              border: "none",
              borderRadius: "3px",
            }}
            id="inline-djLZrZMTFRPjUsorhPeK"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="WebToast"
            data-height="600"
            data-layout-iframe-id="inline-djLZrZMTFRPjUsorhPeK"
            data-form-id="djLZrZMTFRPjUsorhPeK"
            title="WebToast"></iframe>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Pricing;
