import { apps } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { FeatureKey } from "@/lib/features";

export type AppFromDb = InferSelectModel<typeof apps>;

export type AppWithParsedFields = Omit<AppFromDb, "features"> & {
  features: FeatureKey[];
};

export const getAppFromStore = (store: {
  app?: AppWithParsedFields;
}): AppWithParsedFields => {
  if (!store?.app) {
    throw new Error("You are using `app` outside of a :slug app route!");
  }

  return store.app;
};
