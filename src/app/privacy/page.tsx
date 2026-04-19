import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Privacy Policy — roofing.sydney",
  description: "How roofing.sydney collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link href="/" className="text-xs font-medium text-muted hover:text-foreground">
            ← Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted">Last updated: 1 January 2025</p>

          <div className="prose mt-8 space-y-8 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="text-base font-semibold">1. Who we are</h2>
              <p className="mt-2 text-muted">
                roofing.sydney is operated by a licensed metal roofing contractor based in Sydney,
                New South Wales, Australia. We offer an online roof colour preview tool and connect
                homeowners with our quoting team.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">2. What we collect</h2>
              <p className="mt-2 text-muted">When you use our address preview tool we process:</p>
              <ul className="mt-2 list-disc pl-5 text-muted">
                <li>Your property address (to fetch the aerial view)</li>
                <li>Geographic coordinates derived from your address</li>
              </ul>
              <p className="mt-2 text-muted">
                When you request a quote we additionally collect your name, phone number, email
                address, preferred contact time, and any notes you provide.
              </p>
              <p className="mt-2 text-muted">
                We also automatically collect your IP address and browser user-agent for security
                and spam-prevention purposes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">3. How we use your information</h2>
              <ul className="mt-2 list-disc pl-5 text-muted">
                <li>To display aerial imagery and the roof colour preview</li>
                <li>To contact you about your quote request</li>
                <li>To send you a confirmation of your enquiry</li>
                <li>To prevent spam and abuse</li>
              </ul>
              <p className="mt-2 text-muted">
                We do not sell, rent or share your personal information with third parties for
                marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">4. Third-party services</h2>
              <p className="mt-2 text-muted">We use the following services to operate the site:</p>
              <ul className="mt-2 list-disc pl-5 text-muted">
                <li>
                  <strong>Google Maps Platform</strong> — address autocomplete (subject to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  )
                </li>
                <li>
                  <strong>Mapbox / Nearmap</strong> — aerial satellite imagery of your property
                </li>
                <li>
                  <strong>Replicate</strong> — AI roof segmentation (your aerial image is sent to
                  their servers for processing and is not retained beyond the immediate request)
                </li>
                <li>
                  <strong>Supabase</strong> — secure database storage for lead enquiries
                </li>
                <li>
                  <strong>Resend</strong> — transactional email delivery
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold">5. Data retention</h2>
              <p className="mt-2 text-muted">
                Quote enquiry data is retained for up to 7 years for business record-keeping
                purposes in accordance with Australian tax and consumer law. You may request
                deletion at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">6. Your rights</h2>
              <p className="mt-2 text-muted">
                Under the Australian Privacy Act 1988 and the Australian Privacy Principles you
                have the right to access, correct or request deletion of personal information we
                hold about you. To exercise these rights, contact us at the address below.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">7. Cookies</h2>
              <p className="mt-2 text-muted">
                We do not use tracking cookies. The map tile requests use session-level browser
                storage only and do not persist beyond your visit.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold">8. Contact</h2>
              <p className="mt-2 text-muted">
                For any privacy-related questions or requests, email us at{" "}
                <a href="mailto:privacy@roofing.sydney" className="underline hover:text-foreground">
                  privacy@roofing.sydney
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
