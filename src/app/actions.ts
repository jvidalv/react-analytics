"use server";

import { Resend } from "resend";
import { google } from "googleapis";
import { signOut } from "@/auth";
import { WaitlistJoinEmail } from "@/components/emails/waitlist-join";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitEmail(formData: FormData) {
  try {
    const email = formData.get("email");
    if (!email) return { success: false };

    void resend.emails.send({
      from: "Josep <josep@expofast.app>",
      to: [email as string],
      subject: "You’re In! Welcome to ExpoFast 🚀",
      react: WaitlistJoinEmail(),
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: "expofast@sheets-447720.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDrn2UfTlGzcZP7\\nWEqhaL/KDA2syFcWxVNIbKp5cLo42wdftaEV3/taDqasEsbDBd/7ILS68C3uiOqv\\nVy1wXT5DtKToXZHcH7cdo3705EARBqS9tYm6x1VwzatjSieNJoUd4N1jwBT3s6Mr\\nqgTJwpkGJd4h0b5bvTfWjF9GhXmlFY+jZIL8wpv4VYCAhaZqzMw0ivscVfsA4He8\\nUnxmlI9DXGhI0WqHD698Nl2DdtNA4tQ/vGjNf2655Q1JaVOAnSP5wa8xAI1HqDoJ\\nXemOjSHZk6ezip/+Zi5Dlr3Cf8sHQGs7PlKMiBz0L/Pd1O4GYgCiEhIF7zkZffUF\\n2hFTLkVvAgMBAAECggEAQv/epdHD6qYrwadgBVi/XIkj5FNNbFSs82Wu7fxPf7ZM\\nePsxNIKtuvR6kWh/a1pCz+qDabq9HNyC+1vrOE3TVDZMRCTDQpgkHkHs6l7zFsRQ\\nWP+DjAB9e6eICiI+b+UZqh7UZTZr3+mNRu/AD80NbVGcQfqdygFanN/qgaeXqQiW\\nSa4W4EmbyEKyk4S+z5ata3ZgJHMEr8hi7LcbHINmbQ3PzyIQrpkpaf7nt6PRpmd7\\nnNVgfVRPjWXaZ4n8ZvifVbEzafzaEZvWb876jhrpDk3yhDbPIHp8kUTMh+paISbv\\ngZctM3gFRu8SlvXLXGRl9X/h1QPMAeD5v3Djw3t/xQKBgQD7n1BVC17Fk7BPEHWh\\nBEkxqSd4Zx39ezw2Xn2wu5k589iNobX1Rv04O4kGp2dAuVN+xLyOAEBS17u36dyA\\n907F5gu6mEIYzQxbMPUdn2udbp0EOOuZNtcU6QWR1GlpJJrL4ifDxmcdBDNeToou\\nyBBi5xxCcrt7ZTzZXGwAwlpHLQKBgQDvuNI2aeLg2xhCIeLx2sr+9G0jkPiJRgYG\\n9Fe6OFEoSZkQ9rBPam0XEb8SNQzQZ+FKOa+asbTFFPoLur8DHJwp/q96FeStlAfn\\n/8uOLWGyAjsWNcXLjCvhnkzfdXZl50aH/o6sBn3aZq9ofoxDJw0f2ARAP8YxeN5Z\\nc/g7GtQgiwKBgF6QcypjCY0LgjlUoECRUci+H71aU6UOCYUNYgNnnaBwCjTAT5gM\\nw+G8TjUX+PAUNlLwMUTUx1fbCAuIcnxtdUdeu4225zBW74veDGDDpzgVeCE8Gx8L\\nwy1yncs+nxcK0LpLFlK3X81B5OROdBQ80Bu7a511bQxk8cdmuphWcoNJAoGAcvUq\\nubVle3cV1wDxGBJYLpOAkwG+bfYKheM+/qprIOrKYHwsaKkcz2dPPaf7ESX/v9yR\\n/ZkimzBICL/xQcjCitD7zYwaMbM/Z14fe3r/0qGHPEtlIwuBL5z+OFrYAF48UJMe\\nUBh82fNMQswM71cW0CKDR1xN6wOPfU5Dx/RBrakCgYEA1pFbZyDJUnGly7GSKXpR\\nSdaZJpvLD8V54JjHGBNSYiXjogY06uIM/cfN69SP26E2+HZ71b/b8VePww5dIzKM\\njG0yXFWSUk/k+DRE+ztZlIF1sLJ8NzZXrK2ObeI6lpfVXrWm5hpr2Vlm9cGjJ63/\\nmHJs7rrfatT61IZTAC8F4Fg=\\n-----END PRIVATE KEY-----\\n".replace(
            /\\n/g,
            "\n",
          ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    void sheets.spreadsheets.values.append({
      spreadsheetId: "1FL4Tl4VBnafBtHVRBTwfzhFrPRViVwF_6DE6OxIyCBs",
      range: "[Emails] 2025!A:A",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["expofast", new Date().toISOString(), email]],
      },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/join" });
}
