"use client";

import * as React from "react";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Infinity, Plus, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMe, User, useUpdateUser } from "@/domains/user/me.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PRICE_PLANS } from "@/domains/plan/api.plan";
import { getPlanDisplayName, getPlanEmoji, PlanType } from "@/domains/plan/plan.utils";

export default function AccountPage() {
  const { me } = useMe();
  return (
    <div className="space-y-6">
      {!me ? (
        <>
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-96 w-full" />
        </>
      ) : (
        <>
          <AccountForm user={me} />
          <PlanSection user={me} />
        </>
      )}
    </div>
  );
}

function AccountForm({ user }: { user: User }) {
  const { toast } = useToast();
  const { updateUser, isUpdating } = useUpdateUser();
  const [name, setName] = useState(user.name ?? undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateUser({ name });
    toast({
      title: "Account details updated",
      description: "Your details have been successfully updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Update your account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-6">
            <div className="flex flex-col gap-1.5">
              <Label>Avatar</Label>
              <Avatar className="flex size-32 items-center justify-center">
                <AvatarImage src={user.image ?? undefined} alt="avatar" />
                <AvatarFallback>
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="grid w-full flex-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input
                  placeholder="your@email.com"
                  disabled
                  defaultValue={user.email}
                  type="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input
                  placeholder="Your name"
                  onChange={(e) => setName(e.target.value)}
                  defaultValue={name ?? undefined}
                  type="text"
                />
              </div>
              <Button
                isLoading={isUpdating}
                type="submit"
                className="mt-4 w-fit"
              >
                Save <Save />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PlanSection({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
        <CardDescription>
          Your current plan and available upgrades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm">
            Your current plan is{" "}
            <div
              className={cn(
                "flex h-8 items-center  border px-2 text-sm capitalize",
                user.plan === "starter" &&
                  "bg-orange-900/30 border-orange-500/50 text-orange-500/70",
                user.plan === "free" && "bg-neutral-900/80 text-neutral-400",
                user.plan === "pro" &&
                  "bg-indigo-900/50 border-indigo-400/30  text-indigo-400 ",
              )}
            >
              <span className="mr-2 font-medium">{getPlanDisplayName(user.plan as PlanType)}</span>
              {getPlanEmoji(user.plan as PlanType)}
            </div>
          </div>
          {(user.plan === "free" || user.plan === "starter") && (
            <div className="grid grid-cols-2 gap-4">
              {PRICE_PLANS.filter(
                (p) =>
                  p.title.toLowerCase().includes("pro") ||
                  (user.plan === "free" &&
                    p.title.toLowerCase().includes("starter")),
              ).map(
                (
                  {
                    title,
                    price,
                    slashedPrice,
                    crossedBulletPoints,
                    bulletPoints,
                    payOnce,
                    ctaText,
                    allThePrevious,
                    ctaButtonVariant,
                    ctaUrl,
                  },
                  index,
                ) => (
                  <div
                    key={title}
                    className={cn(
                      "flex flex-col  border p-4 sm:p-6",
                      index === 2 && "border-emerald-400",
                    )}
                  >
                    <h4 className="mb-4 text-2xl font-medium">{title}</h4>
                    <div className="mb-6 flex items-center gap-2">
                      {slashedPrice && (
                        <span className="text-4xl font-black text-muted-foreground line-through">
                          ${slashedPrice}
                        </span>
                      )}
                      <span className="text-6xl font-black">${price}</span>
                    </div>
                    <ul className="mb-8 flex flex-col gap-1.5">
                      {allThePrevious && (
                        <li className="flex items-center gap-2 text-foreground/80">
                          <div>
                            <Plus />
                          </div>
                          <div className="text-lg font-medium sm:text-xl">
                            All the previous
                          </div>
                        </li>
                      )}
                      {bulletPoints.map((bp) => (
                        <li key={bp} className="flex items-center gap-2">
                          <div>
                            <Check />
                          </div>
                          <div
                            className={cn(
                              "text-lg sm:text-xl font-medium",
                              "ExpoFast starter" === bp &&
                                "text-blue-500 font-semibold",
                              "Lifetime updates" === bp &&
                                "text-emerald-500 font-semibold",
                              "Access to our apps code" === bp &&
                                "text-indigo-500",
                            )}
                          >
                            {bp} {"Lifetime updates" === bp && "🏆"}
                            {"Access to our apps code" === bp && "⭐"}
                          </div>
                        </li>
                      ))}

                      {crossedBulletPoints?.map((bp) => (
                        <li
                          key={bp}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <div>
                            <X />
                          </div>
                          <div className="text-lg font-medium sm:text-xl">
                            {bp}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <a href={ctaUrl} target="_blank">
                        <Button
                          // @ts-expect-error -- acceptable risk
                          variant={ctaButtonVariant}
                          size="lg"
                          className="w-full text-base"
                        >
                          {ctaText} →
                        </Button>
                      </a>
                      {payOnce ? (
                        <div className="mt-2">
                          <span className="flex items-center justify-center gap-1">
                            One payment, <Infinity alt-title="infinite" /> apps.
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 opacity-0">
                          <span className="flex items-center justify-center gap-1">
                            One payment, <Infinity alt-title="infinite" /> apps.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
