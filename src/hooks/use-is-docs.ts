import { usePathname } from "next/navigation";

export const useIsDocs = () => {
  const pathname = usePathname();
  return pathname.startsWith("/app/docs");
};
