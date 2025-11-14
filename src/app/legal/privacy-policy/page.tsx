import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function PrivacyPolicy() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-5xl font-black">Privacy policy</h1>
        <article className="prose prose-invert">
          <p>
            At <strong>ExpoFast</strong>, we are committed to respecting your
            privacy regarding any information we collect from you across our
            website and other platforms we own and operate.
          </p>
          <h2>Data Collection</h2>
          <p>
            We only request personal information when it is genuinely necessary
            to provide you with a service. This data is collected through fair
            and lawful means, with your knowledge and consent. Additionally, we
            inform you of why we are collecting it and how it will be used.
          </p>
          <h2>Google Account Sign-Up</h2>
          <p>
            You can sign up using your Google account, allowing your{" "}
            <strong>ExpoFast</strong> account username to be prefilled with your
            name and public profile picture.
          </p>
          <h2>Data Retention & Security</h2>
          <p>
            We retain collected data only for as long as needed to deliver the
            requested service. Any stored data is protected using commercially
            acceptable security measures to prevent loss, theft, unauthorized
            access, disclosure, copying, use, or modification.
          </p>
          <h2>Data Sharing</h2>
          <p>
            We do not share personally identifiable information publicly or with
            third parties, except when legally required.
          </p>

          <h2>Compliance with GDPR</h2>
          <p>
            With respect to applicable data protection laws, including the{" "}
            <strong>EU General Data Protection Regulation (GDPR)</strong>,{" "}
            <strong>ExpoFast</strong> acts as both a data controller and
            processor for the personal data handled through our platform and
            services.
          </p>
          <h2>External Links</h2>
          <p>
            Our website may contain links to external sites that we do not
            operate. Please note that we have no control over these sites
            content or practices and cannot take responsibility for their
            privacy policies.
          </p>
          <h2>Your Choices</h2>
          <p>
            You are free to decline our request for personal information, but
            this may limit our ability to provide certain services.
          </p>
          <h2>Acceptance & Contact</h2>
          <p>
            Your continued use of our website signifies your acceptance of our
            privacy practices. If you have any questions about how we manage
            user data and personal information, please feel free to{" "}
            <a
              href="mailto:josepvidalvidal@gmail.com"
              className="text-blue-600 underline"
            >
              contact us
            </a>
            .
          </p>
          <p>
            <em>
              This policy is effective as of <strong>January 31, 2025</strong>.
            </em>
          </p>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
