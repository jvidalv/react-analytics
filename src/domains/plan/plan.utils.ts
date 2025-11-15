export type PlanType = "free" | "starter" | "pro";

export const PLAN_NAMES: Record<PlanType, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export const PLAN_EMOJIS: Record<PlanType, string> = {
  free: "🎯",
  starter: "🚀",
  pro: "💎",
};

export const getPlanDisplayName = (plan: PlanType): string => {
  return PLAN_NAMES[plan];
};

export const getPlanEmoji = (plan: PlanType): string => {
  return PLAN_EMOJIS[plan];
};

export const shouldOfferUpgrade = (plan: PlanType): boolean => {
  return plan === "free" || plan === "starter";
};
