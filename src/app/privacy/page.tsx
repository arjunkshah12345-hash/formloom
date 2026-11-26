import type { Metadata } from "next";
import { LegalPage } from "@/components/app/LegalPage";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

const REPO = "https://github.com/arjunkshah12345-hash/formloom";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="21 November 2026">
      <p>
        This policy covers the hosted Formloom service at formloom.app. If you run Formloom on
        your own server, your data never reaches us and this policy does not apply.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>Your account: email address, display name, and a hashed password if you set one.</li>
        <li>
          If you sign in with Google: your Google account ID, email address and name. We ask only for the basic
          &ldquo;openid email profile&rdquo; scopes and never see your Google password.
        </li>
        <li>The forms you build, the responses they collect, and files respondents upload.</li>
        <li>A session cookie that keeps you signed in. We use no tracking or advertising cookies.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run the service: signing you in, showing you your forms and results, and delivering webhooks you
        configure. We do not sell data, show ads, or share it with third parties beyond the infrastructure that hosts
        the service (Cloudflare).
      </p>

      <h2>Form responses</h2>
      <p>
        Responses belong to the form owner. If you answered someone&rsquo;s form and want your answer changed or
        removed, contact the person who sent it to you.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Deleting a form deletes its responses. To delete your whole account, open an issue on the{" "}
        <a href={`${REPO}/issues`}>GitHub repository</a> and we will remove it.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top will change with it.</p>
    </LegalPage>
  );
}
