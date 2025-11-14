type PricePlan = {
  title: string;
  price: string;
  slashedPrice?: string;
  bulletPoints: string[];
  crossedBulletPoints?: string[];
  ctaText: string;
  ctaButtonVariant?: string;
  ctaUrl: string | undefined;
  perMonth?: boolean;
  payOnce?: boolean;
  allThePrevious?: boolean;
};

export const PRICE_PLANS: PricePlan[] = [
  {
    title: "Free 🎯",
    price: "0",
    bulletPoints: [
      "1 project",
      "30 days data retention",
      "10,000 events/month",
      "Basic analytics dashboard",
      "Event tracking (navigation, actions, errors)",
    ],
    crossedBulletPoints: ["Unlimited projects", "Unlimited data retention"],
    ctaText: "Start Free",
    ctaButtonVariant: "outline",
    ctaUrl: process.env.NEXT_PUBLIC_FREE_PLAN,
  },
  {
    title: "Starter 🚀",
    price: "9.99",
    perMonth: true,
    bulletPoints: [
      "3 projects",
      "Unlimited data retention",
      "100,000 events/month",
      "Advanced filtering & exports",
      "Email support",
    ],
    crossedBulletPoints: ["Unlimited projects", "Priority support"],
    ctaText: "Get Starter",
    allThePrevious: true,
    ctaUrl: process.env.NEXT_PUBLIC_STARTER_PLAN,
  },
  {
    title: "Pro 💎",
    price: "19.99",
    perMonth: true,
    bulletPoints: [
      "Unlimited projects",
      "Unlimited data retention",
      "Unlimited events",
      "Advanced filtering & exports",
      "Custom integrations",
      "Priority support",
      "Team collaboration",
    ],
    ctaText: "Get Pro",
    allThePrevious: true,
    ctaUrl: process.env.NEXT_PUBLIC_PRO_PLAN,
  },
];
