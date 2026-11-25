import type { Post } from "./types";
import aiAgentForms from "./ai-agent-forms";
import bestTypeformAlternatives from "./best-typeform-alternatives";
import formloomVsTypeform from "./formloom-vs-typeform";
import freeTypeformStyleForm from "./free-typeform-style-form";
import googleFormsAlternatives from "./google-forms-alternatives";
import isTypeformFree from "./is-typeform-free";
import jotformAlternatives from "./jotform-alternatives";
import openSourceTypeformAlternative from "./open-source-typeform-alternative";
import selfHostedFormBuilder from "./self-hosted-form-builder";
import tallyAlternatives from "./tally-alternatives";
import typeformPricing from "./typeform-pricing";
import typeformVsGoogleForms from "./typeform-vs-google-forms";
import typeformVsTally from "./typeform-vs-tally";

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
  isTypeformFree,
  typeformVsGoogleForms,
  typeformVsTally,
  freeTypeformStyleForm,
].sort((a, b) => (b.updated ?? b.date).localeCompare(a.updated ?? a.date));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const readingMinutes = (p: Post) => Math.max(1, Math.round(p.body.split(/\s+/).length / 230));
