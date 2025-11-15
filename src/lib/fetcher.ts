import { treaty } from "@elysiajs/eden";
import { Api } from "@/api/routes";
import { logout } from "@/app/actions";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const fetcherPublic = treaty<Api>(APP_URL).api.public;

export const fetcherProtected = treaty<Api>(APP_URL, {
  onResponse: (response) => {
    if (!response.ok) {
      if (response.status === 401) {
        void logout();
      }
    }
  },
}).api.protected;
