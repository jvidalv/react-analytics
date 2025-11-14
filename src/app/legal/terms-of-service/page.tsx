import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function PrivacyPolicy() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-5xl font-black">Terms of service</h1>
        <article className="prose prose-invert">
          <h2>1. Introduction</h2>
          <p>
            By using <strong>React Analytics</strong>, you confirm your acceptance of,
            and agree to be bound by, these terms and conditions.
          </p>

          <h2>2. Agreement to Terms and Conditions</h2>
          <p>
            This Agreement takes effect on the date on which you first use the{" "}
            <strong>React Analytics</strong> service.
          </p>

          <h2>3. Service License and Access</h2>
          <p>
            <strong>React Analytics</strong> provides both a hosted analytics
            service and an open-source self-hosted option. For the hosted service,
            subscription plans grant users access to analytics tracking, dashboard
            visualization, and data storage capabilities. Tailored for developers,
            product teams, and businesses, <strong>React Analytics</strong>{" "}
            empowers users to track and understand user behavior across their
            React applications.
          </p>
          <p>
            Subscription plans offer straightforward pricing with monthly billing.
            The Free tier provides limited access at no cost. Paid subscriptions
            (Starter and Pro) grant access to additional features and higher usage
            limits. The service provider retains the right to modify or terminate
            service access with reasonable notice, except where prohibited by
            applicable law.
          </p>
          <p>
            The open-source version of <strong>React Analytics</strong> is
            available under the MIT License for self-hosting. Self-hosted
            deployments operate independently of the hosted service and are
            subject to the terms of the MIT License available in the repository.
          </p>

          <h2>4. Refunds</h2>
          <p>
            Due to the nature of the <strong>React Analytics</strong> service,
            subscription fees are generally non-refundable once service access
            has been provided. Refund requests may be considered on a case-by-case
            basis within 7 days of initial subscription purchase.
          </p>

          <h2>5. Disclaimer</h2>
          <p>
            It is not warranted that <strong>React Analytics</strong> will meet your
            requirements or that its operation will be uninterrupted or
            error-free. All express and implied warranties or conditions not
            stated in this Agreement (including, without limitation, loss of
            profits, loss or corruption of data, business interruption, or loss
            of contracts), insofar as such exclusion or disclaimer is permitted
            under applicable law, are excluded and expressly disclaimed. This
            Agreement does not affect your statutory rights.
          </p>

          <h2>6. Warranties and Limitation of Liability</h2>
          <p>
            <strong>React Analytics</strong> does not provide any warranty, guarantee,
            or other assurance regarding the quality, fitness for purpose, or
            other aspects of the service. <strong>React Analytics</strong> shall not
            be liable to you by reason of any representation (unless
            fraudulent), or any implied warranty, condition, or other term, or
            any duty at common law, for any loss of profit or any indirect,
            special, or consequential loss, damage, costs, expenses, or other
            claims (whether caused by <strong>React Analytics</strong>`s negligence,
            its employees, or agents) that arise out of or in connection with
            the provision of any goods or services by <strong>React Analytics</strong>.
          </p>
          <p>
            <strong>React Analytics</strong> shall not be liable or deemed to be in
            breach of contract due to any delay in performing, or failure to
            perform, any of its obligations if the delay or failure was caused
            by circumstances beyond its reasonable control. Notwithstanding any
            contrary clauses in this Agreement, in the event that{" "}
            <strong>React Analytics</strong> is deemed liable to you for a breach of
            this Agreement, you agree that <strong>React Analytics</strong>`s liability
            is limited to the amount actually paid by you for its services.
            You hereby release <strong>React Analytics</strong> from any and
            all obligations, liabilities, and claims exceeding this limitation.
          </p>

          <h2>7. Responsibilities</h2>
          <p>
            <strong>React Analytics</strong> is not responsible for how users
            collect, store, or use analytics data from their applications.
            Users are responsible for complying with all applicable privacy
            laws and regulations when using the service, including obtaining
            proper consent from end users when required.
          </p>

          <h2>8. Price Adjustments</h2>
          <p>
            As we continue to improve <strong>React Analytics</strong> and expand our
            offerings, subscription prices may change. Existing subscribers will
            be notified of price changes with reasonable advance notice and may
            be grandfathered into current pricing or offered the option to cancel
            their subscription.
          </p>

          <h2>9. General Terms and Governing Law</h2>
          <p>
            This Agreement is governed by the laws of <strong>Spain</strong>.
            You acknowledge that no joint venture, partnership, employment, or
            agency relationship exists between you and <strong>React Analytics</strong>{" "}
            as a result of your use of these services. You agree not to present
            yourself as a representative, agent, or employee of{" "}
            <strong>React Analytics</strong>. You also agree that{" "}
            <strong>React Analytics</strong> will not be liable for any representation,
            act, or failure to act on your part.
          </p>

          <p>
            <em>
              Last updated: <strong>January 31, 2025</strong>.
            </em>
          </p>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
