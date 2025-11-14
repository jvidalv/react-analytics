import { AnalyticsUser } from "@/domains/app/users/users.api";

export const getUserName = (analyticsUser: AnalyticsUser) => {
  if (
    analyticsUser.userInformation?.firstName &&
    analyticsUser.userInformation?.lastName
  ) {
    return `${analyticsUser.userInformation?.firstName} ${analyticsUser.userInformation?.lastName}`;
  }

  if (analyticsUser.userInformation?.firstName) {
    return analyticsUser.userInformation?.firstName;
  }

  if (analyticsUser.userInformation?.lastName) {
    return analyticsUser.userInformation?.lastName;
  }

  if (analyticsUser.userInformation?.email) {
    return analyticsUser.userInformation?.email;
  }

  return analyticsUser.identifyId.split("-")[0];
};
