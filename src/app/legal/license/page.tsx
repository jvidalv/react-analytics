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
              <strong>Personal License:</strong> Build unlimited projects as an
              individual.
            </li>
            <li>
              <strong>Team License:</strong> Build unlimited projects as a team.
            </li>
          </ul>

          <p>
            This License Agreement (&apos;Agreement&apos;) is entered into
            between <strong>ExpoFast</strong>, represented by Josep Vidal, whose
            contact information is{" "}
            <a
              href="mailto:josepvidalvidal@gmail.com"
              className="text-blue-600 underline"
            >
              josepvidalvidal@gmail.com
            </a>
            , and you, the user (&apos;Licensee&apos;), regarding the use of the{" "}
            <strong>ExpoFast</strong> coding boilerplate (the
            &apos;Product&apos;) available at{" "}
            <a href="https://expofast.app" className="text-blue-600 underline">
              https://expofast.app
            </a>{" "}
            (the &apos;Website&apos;). By downloading, accessing, or using the
            Product, Licensee agrees to be bound by the terms and conditions of
            this Agreement.
          </p>

          <h2>1. Grant of License</h2>

          <h3>1.1 Personal License</h3>
          <p>
            Subject to the terms and conditions of this Agreement,{" "}
            <strong>ExpoFast</strong> grants Licensee a non-exclusive,
            non-transferable, and non-sublicensable{" "}
            <strong>Personal License</strong> to use the{" "}
            <strong>ExpoFast</strong> coding boilerplate for the following
            purposes:
          </p>
          <ul>
            <li>Create unlimited projects.</li>
            <li>
              Build and develop applications or websites for personal or
              commercial use.
            </li>
          </ul>

          <h3>1.2 Team License</h3>
          <p>
            Subject to the terms and conditions of this Agreement,{" "}
            <strong>ExpoFast</strong> grants Licensee a non-exclusive,
            non-transferable, and non-sublicensable{" "}
            <strong>Team License</strong> to use the <strong>ExpoFast</strong>{" "}
            coding boilerplate for the following purposes:
          </p>
          <ul>
            <li>Create unlimited projects.</li>
            <li>
              Build and develop applications or websites as part of a team.
            </li>
            <li>Share the code with other members of the team.</li>
          </ul>

          <h2>2. Restrictions</h2>
          <p>Licensee shall not:</p>
          <ul>
            <li>
              Resell or redistribute the <strong>ExpoFast</strong> boilerplate
              as a standalone product.
            </li>
            <li>
              Remove, alter, or obscure any copyright, trademark, or other
              proprietary notices from the <strong>ExpoFast</strong>{" "}
              boilerplate.
            </li>
            <li>
              Use the <strong>ExpoFast</strong> boilerplate in any way that
              violates applicable laws, regulations, or third-party rights.
            </li>
            <li>
              Sub-license, rent, lease, or transfer the{" "}
              <strong>ExpoFast</strong> boilerplate or any rights granted under
              this Agreement.
            </li>
          </ul>

          <h2>3. Ownership and Intellectual Property</h2>
          <p>
            <strong>ExpoFast</strong> retains all ownership and intellectual
            property rights in and to the <strong>ExpoFast</strong> boilerplate.
            This Agreement does not grant Licensee any ownership rights in the{" "}
            <strong>ExpoFast</strong> boilerplate.
          </p>

          <h2>4. Warranty and Disclaimer</h2>
          <p>
            THE <strong>EXPOFAST</strong> BOILERPLATE IS PROVIDED &apos;AS
            IS&apos;; WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
            INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
            NONINFRINGEMENT.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,{" "}
            <strong>EXPOFAST</strong> SHALL NOT BE LIABLE FOR ANY DIRECT,
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
            ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE{" "}
            <strong>EXPOFAST</strong> BOILERPLATE, EVEN IF{" "}
            <strong>EXPOFAST</strong> HAS BEEN ADVISED OF THE POSSIBILITY OF
            SUCH DAMAGES.
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
            <strong>ExpoFast</strong> concerning the subject matter herein and
            supersedes all prior or contemporaneous agreements, representations,
            warranties, and understandings.
          </p>

          <p>
            <em>
              Last updated: <strong>January 31, 2025</strong>.
            </em>
          </p>

          <p>
            <strong>ExpoFast</strong>
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
