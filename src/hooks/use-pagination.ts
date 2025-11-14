import { useRouter, useSearchParams } from "next/navigation";

export const usePagination = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", targetPage.toString());
    return `?${params.toString()}`;
  };

  const goToPage = (targetPage: number) => {
    router.push(createPageHref(targetPage));
  };

  return { createPageHref, goToPage };
};
