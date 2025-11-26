"use client";

import { useState } from "react";
import { analytics } from "@jvidalv/react-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Send } from "lucide-react";

interface ContactFormProps {
  defaultEmail?: string;
  userName?: string;
}

export function ContactForm({ defaultEmail, userName }: ContactFormProps) {
  const [contact, setContact] = useState(defaultEmail || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contact.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send the message via analytics
      analytics.message(contact.trim(), message.trim(), {
        userName,
        source: "contact-page",
      });

      // Clear form and show success
      setMessage("");
      setIsSubmitted(true);

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-500/20">
          <Check className="size-6 text-green-500" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setIsSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact">Email or Phone</Label>
        <Input
          id="contact"
          type="text"
          placeholder="your@email.com or +1234567890"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-muted-foreground">
          How can we reach you back?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us what's on your mind..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !contact.trim() || !message.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Your message will be tracked via React Analytics to demonstrate our
        message feature.
      </p>
    </form>
  );
}
