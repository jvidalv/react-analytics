import { auth } from "@/auth";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { ContactForm } from "./_components/contact-form";

export const metadata = {
  title: "Contact Us - React Analytics",
  description:
    "Get in touch with the React Analytics team. We'd love to hear from you.",
};

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have a question, feedback, or just want to say hello? We'd love to
              hear from you.
            </p>
          </div>
          <ContactForm
            defaultEmail={user?.email || undefined}
            userName={user?.name || undefined}
          />
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
