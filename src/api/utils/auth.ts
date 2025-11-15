import { users } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type StoreUser = InferSelectModel<typeof users>;

export const getUserFromStore = (store: { user?: StoreUser }): StoreUser => {
  if (!store?.user) {
    throw new Error("You are using `user` outside of a protected route!");
  }

  return store.user;
};
