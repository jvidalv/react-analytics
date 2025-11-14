import { UserPlans } from "@/domains/user/me.api";

export const getUserPlanEmoji = (plan: UserPlans) => {
  if (plan === "straw") {
    return "🌾";
  }

  if (plan === "wood") {
    return "🪵";
  }

  return "🪙";
};

export const shouldOfferUpgrade = (plan: UserPlans) => {
  return plan === "straw" || plan === "wood";
};
