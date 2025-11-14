import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function PrivacyPolicy() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-5xl font-black">License</h1>
        <article className="prose prose-invert">
          <h2>TL;DR;</h2>
          <ul>
            <li>
              <strong>Free Tier:</strong> Track analytics on 1 project with 30 days
              data retention as an individual.
            </li>
            <li>
              <strong>Paid Subscriptions (Starter/Pro):</strong> Track analytics on
              multiple projects with unlimited data retention.
            </li>
            <li>
              <strong>Open Source:</strong> Self-host the MIT-licensed open source
              version on your own infrastructure.
            </li>
          </ul>

          <p>
            This License Agreement (&apos;Agreement&apos;) is entered into
            between <strong>React Analytics</strong>, represented by Josep Vidal, whose
            contact information is{" "}
            <a
              href="mailto:josepvidalvidal@gmail.com"
              className="text-blue-600 underline"
            >
              josepvidalvidal@gmail.com
            </a>
            , and you, the user (&apos;Licensee&apos;), regarding the use of the{" "}
            <strong>React Analytics</strong> service (the
            &apos;Service&apos;) available at{" "}
            <a href="https://react-analytics.app" className="text-blue-600 underline">
              https://react-analytics.app
            </a>{" "}
            (the &apos;Website&apos;). By accessing or using the
            Service, Licensee agrees to be bound by the terms and conditions of
            this Agreement.
          </p>

          <h2>1. Grant of Service License</h2>

          <h3>1.1 Free Tier</h3>
          <p>
            Subject to the terms and conditions of this Agreement,{" "}
            <strong>React Analytics</strong> grants Licensee a non-exclusive,
            non-transferable, and non-sublicensable{" "}
            <strong>Free Tier License</strong> to use the{" "}
            <strong>React Analytics</strong> hosted service for the following
            purposes:
          </p>
          <ul>
            <li>Track analytics on up to 1 project/application.</li>
            <li>
              Collect up to 10,000 analytics events per month.
            </li>
            <li>
              Access analytics data with 30 days data retention.
            </li>
            <li>
              Use the service for personal or commercial projects.
            </li>
          </ul>

          <h3>1.2 Paid Subscriptions (Starter/Pro)</h3>
          <p>
            Subject to the terms and conditions of this Agreement and payment of
            applicable subscription fees,{" "}
            <strong>React Analytics</strong> grants Licensee a non-exclusive,
            non-transferable, and non-sublicensable subscription license to use
            the <strong>React Analytics</strong> hosted service with enhanced
            features:
          </p>
          <ul>
            <li>Track analytics on multiple projects (3 for Starter, unlimited for Pro).</li>
            <li>
              Collect increased analytics events per month (100,000 for Starter,
              unlimited for Pro).
            </li>
            <li>Unlimited data retention.</li>
            <li>Advanced filtering, exports, and analytics features.</li>
            <li>Share analytics dashboard access with team members (Pro tier).</li>
          </ul>

          <h3>1.3 Open Source License</h3>
          <p>
            The <strong>React Analytics</strong> open source software is available
            under the MIT License. Licensee may download, modify, and self-host
            the software on their own infrastructure subject to the terms of the
            MIT License available in the GitHub repository.
          </p>

          <h2>2. Restrictions</h2>
          <p>For the hosted service, Licensee shall not:</p>
          <ul>
            <li>
              Resell, redistribute, or sublicense access to the{" "}
              <strong>React Analytics</strong> hosted service without express
              written permission.
            </li>
            <li>
              Attempt to reverse engineer, decompile, or access the source code
              of the hosted service infrastructure.
            </li>
            <li>
              Use the <strong>React Analytics</strong> service in any way that
              violates applicable laws, regulations, privacy laws, or third-party
              rights.
            </li>
            <li>
              Exceed usage limits (events, projects, data retention) applicable
              to your subscription tier without upgrading.
            </li>
            <li>
              Use the service to collect analytics data without proper user
              consent where required by law.
            </li>
          </ul>
          <p>
            The open source self-hosted version is subject to the MIT License
            terms in the repository and not these restrictions.
          </p>

          <h2>3. Ownership and Intellectual Property</h2>
          <p>
            <strong>React Analytics</strong> retains all ownership and intellectual
            property rights in and to the <strong>React Analytics</strong> hosted
            service and its proprietary components. This Agreement does not grant
            Licensee any ownership rights in the hosted service infrastructure.
          </p>
          <p>
            The open source software components are licensed under the MIT License,
            granting Licensee the rights specified in that license for self-hosted
            deployments.
          </p>

          <h2>4. Warranty and Disclaimer</h2>
          <p>
            THE <strong>REACT ANALYTICS</strong> SERVICE IS PROVIDED &apos;AS
            IS&apos; WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
            INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
            NONINFRINGEMENT. NO WARRANTY IS PROVIDED REGARDING UPTIME,
            DATA ACCURACY, OR AVAILABILITY OF THE SERVICE.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,{" "}
            <strong>REACT ANALYTICS</strong> SHALL NOT BE LIABLE FOR ANY DIRECT,
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
            ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE{" "}
            <strong>REACT ANALYTICS</strong> SERVICE, INCLUDING BUT NOT LIMITED
            TO DATA LOSS, BUSINESS INTERRUPTION, OR INACCURATE ANALYTICS DATA,
            EVEN IF <strong>REACT ANALYTICS</strong> HAS BEEN ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h2>6. Governing Law and Jurisdiction</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with
            the laws of <strong>Spain</strong>, without regard to its conflict
            of law principles. Any dispute arising out of or in connection with
            this Agreement shall be subject to the exclusive jurisdiction of the
            courts located in Spain.
          </p>

          <h2>7. Entire Agreement</h2>
          <p>
            This Agreement constitutes the entire agreement between Licensee and{" "}
            <strong>React Analytics</strong> concerning the subject matter herein and
            supersedes all prior or contemporaneous agreements, representations,
            warranties, and understandings.
          </p>

          <p>
            <em>
              Last updated: <strong>January 31, 2025</strong>.
            </em>
          </p>

          <p>
            <strong>React Analytics</strong>
            <br />
            Contact Information:{" "}
            <a
              href="mailto:josepvidalvidal@gmail.com"
              className="text-blue-600 underline"
            >
              josepvidalvidal@gmail.com
            </a>
          </p>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
