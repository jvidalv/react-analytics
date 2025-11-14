import {
  ChartNoAxesColumn,
  CreditCard,
  Database,
  FileJson2,
  Fingerprint,
  Languages,
  Mail,
} from "lucide-react";

export type FeatureKey =
  | "db"
  | "auth"
  | "payments"
  | "emails"
  | "languages"
  | "api"
  | "analytics";

export type Feature = {
  key: FeatureKey;
  name: string;
  Icon: typeof Database;
};

export const FEATURE_ANALYTICS: Feature = {
  key: "analytics",
  name: "Analytics",
  Icon: ChartNoAxesColumn,
};

export const FEATURE_API: Feature = {
  key: "api",
  name: "API",
  Icon: FileJson2,
};

export const FEATURE_DB: Feature = {
  key: "db",
  name: "Database",
  Icon: Database,
};

export const FEATURE_AUTH: Feature = {
  key: "auth",
  name: "Auth",
  Icon: Fingerprint,
};

export const FEATURE_PAYMENTS: Feature = {
  key: "payments",
  name: "Payments",
  Icon: CreditCard,
};

export const FEATURE_EMAILS: Feature = {
  key: "emails",
  name: "Emails",
  Icon: Mail,
};

export const FEATURE_LANGUAGES: Feature = {
  key: "languages",
  name: "Languages",
  Icon: Languages,
};

export const APP_FEATURES: Feature[] = [
  FEATURE_ANALYTICS,
  FEATURE_API,
  FEATURE_DB,
  FEATURE_AUTH,
  FEATURE_PAYMENTS,
  FEATURE_EMAILS,
  FEATURE_LANGUAGES,
];

export const getFeatureByKey = (key: Feature["key"]): Feature => {
  return APP_FEATURES.find((feature) => feature.key === key)!;
};
