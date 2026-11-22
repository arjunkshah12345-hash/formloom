import type { Post } from "./types";
import aiAgentForms from "./ai-agent-forms";
import bestTypeformAlternatives from "./best-typeform-alternatives";
import formloomVsTypeform from "./formloom-vs-typeform";
import googleFormsAlternatives from "./google-forms-alternatives";
import jotformAlternatives from "./jotform-alternatives";
import openSourceTypeformAlternative from "./open-source-typeform-alternative";
import selfHostedFormBuilder from "./self-hosted-form-builder";
import tallyAlternatives from "./tally-alternatives";
import typeformPricing from "./typeform-pricing";

export type { Post };

/** Every post, newest first. The pillar post leads ties. */
export const POSTS: Post[] = [
  bestTypeformAlternatives,
  openSourceTypeformAlternative,
  formloomVsTypeform,
  typeformPricing,
  tallyAlternatives,
  googleFormsAlternatives,
  jotformAlternatives,
  selfHostedFormBuilder,
  aiAgentForms,
].sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const readingMinutes = (p: Post) => Math.max(1, Math.round(p.body.split(/\s+/).length / 230));
