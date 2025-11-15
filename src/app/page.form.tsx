"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { submitEmail } from "@/app/actions";

export default function HomeForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSuccess) {
      return;
    }

    setStatus("idle");

    const formData = new FormData(event.currentTarget);
    const result = await submitEmail(formData);

    setStatus(result.success ? "success" : "error");
  }

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        id="email"
        name="email"
        disabled={isSuccess}
        required
        placeholder="me@email.com"
        className="mb-4 w-full  border-4 border-primary py-6 text-center !text-xl backdrop-blur-lg focus:border-primary focus-visible:ring-primary"
      />
      <Button
        className={cn(
          "w-full text-xl py-6",
          isSuccess && "bg-green-700",
          isError && "bg-red-700",
        )}
      >
        {isSuccess ? "Received!" : "Join"}
      </Button>
    </form>
  );
}
