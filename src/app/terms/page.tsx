import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of the Australian Roofing Contractors website.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link href="/" className="text-xs font-medium text-muted hover:text-foreground">
            ← Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted">Last updated: 1 January 2025</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground">1. Acceptance</h2>
              <p className="mt-2 text-muted">
                By accessing or using Australian Roofing Contractors (&ldquo;the Service&rdquo;) you agree to be
                bound by these Terms. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. Use of the Service</h2>
              <p className="mt-2 text-muted">
                The Service provides an aerial roof colour visualisation tool and connects
                homeowners with a roofing contractor for quote enquiries. You may use the Service
                only for lawful purposes and only in relation to properties for which you have
                authorisation to make enquiries.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">3. Colour accuracy</h2>
              <p className="mt-2 text-muted">
                The Colorbond colour preview is an approximation only. Actual finished roof colour
                will vary based on lighting, roof pitch, surrounding environment, screen calibration
                and batch variation in the steel product. Always confirm your colour choice against
                a physical sample before signing a contract.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">4. Quotes</h2>
              <p className="mt-2 text-muted">
                Submitting a quote request form creates no binding contract and imposes no
                obligation on either party. A formal written quote will be provided following an
                on-site assessment and is subject to separate terms agreed at that time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">5. Aerial imagery</h2>
              <p className="mt-2 text-muted">
                Aerial imagery is sourced from third-party providers and may not reflect the
                current state of a property. We make no representation as to the accuracy,
                currency or completeness of any imagery displayed.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">6. AI segmentation</h2>
              <p className="mt-2 text-muted">
                The roof detection feature uses an AI model (Meta SAM-2) and may not correctly
                identify the roof in all cases. Results are provided for illustrative purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">7. Intellectual property</h2>
              <p className="mt-2 text-muted">
                All content on the Service, except aerial imagery, is owned by or licensed to
                Australian Roofing Contractors. You may not reproduce, distribute or create derivative works
                without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">8. Limitation of liability</h2>
              <p className="mt-2 text-muted">
                To the maximum extent permitted by law, we exclude all liability for loss or damage
                arising from your use of the Service, including any reliance on the colour preview,
                segmentation results or quote estimates.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">9. Governing law</h2>
              <p className="mt-2 text-muted">
                These Terms are governed by the laws of New South Wales, Australia. Any dispute
                shall be subject to the exclusive jurisdiction of the courts of New South Wales.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">10. Changes</h2>
              <p className="mt-2 text-muted">
                We may update these Terms at any time. Continued use of the Service after changes
                are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">11. Contact</h2>
              <p className="mt-2 text-muted">
                Questions about these Terms?{" "}
                <a href="mailto:hello@roofing.sydney" className="underline hover:text-foreground">
                  hello@roofing.sydney
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
