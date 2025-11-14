import useSWRMutation from "swr/mutation";

type UploadResponse = {
  url: string;
};

const uploadImageFetcher = async (
  url: string,
  { arg }: { arg: { file: File; type: string } },
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", arg.file);
  formData.append("type", arg.type);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
};

export const useUploadImage = () => {
  const { trigger, isMutating, data, error } = useSWRMutation(
    "/api/image/public",
    uploadImageFetcher,
  );

  return {
    uploadImage: trigger,
    isUploading: isMutating,
    uploadedUrl: data?.url,
    error,
  };
};
