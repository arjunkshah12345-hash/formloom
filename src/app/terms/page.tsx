import type { Metadata } from "next";
import { LegalPage } from "@/components/app/LegalPage";

export const metadata: Metadata = { title: "Terms of service · Formloom" };

const REPO = "https://github.com/arjunkshah12345-hash/formloom";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="21 November 2026">
      <p>
        These terms cover the hosted Formloom service. The Formloom source code is separately available under the{" "}
        <a href={`${REPO}/blob/main/LICENSE`}>MIT licence</a>.
      </p>

      <h2>Using the service</h2>
      <ul>
        <li>The hosted service is free and provided as is, without warranties of any kind.</li>
        <li>You are responsible for the forms you publish and the data you collect with them.</li>
        <li>
          Don&rsquo;t use Formloom for phishing, collecting passwords or payment card numbers, spam, or anything
          illegal. We may remove forms or accounts that do.
        </li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of your forms and responses. You can export responses as CSV at any time, and you can move
        to a self-hosted copy whenever you like.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the service running but can&rsquo;t guarantee uptime, and we may change or end the hosted
        service. For guaranteed control, self-host it.
      </p>

      <h2>Liability</h2>
      <p>To the extent the law allows, we are not liable for any loss arising from use of the service.</p>

      <h2>Privacy</h2>
      <p>
        See the <a href="/privacy">privacy policy</a>.
      </p>
    </LegalPage>
  );
}
