import type { Post } from "./types";

const post: Post = {
  slug: "free-typeform-style-form",
  title: "How to make a Typeform-style form for free",
  description:
    "How to build a one-question-at-a-time, Typeform-style form for free in about five minutes: questions, logic, a theme, then share or embed it. No credit card.",
  date: "2026-11-25",
  keywords: [
    "how to make a typeform for free",
    "typeform style form free",
    "how to create a typeform-like form",
    "conversational form builder free",
    "one question at a time form",
    "free typeform alternative",
  ],
  tldr:
    "To make a Typeform-style form for free, use a builder that shows one question at a time. With Formloom (free, open source): sign up, pick a template or start blank, add questions, set logic jumps, pick a theme, then publish and share the link or embed it. The free plan includes 1,000 responses a month.",
  faq: [
    {
      q: "How do I make a form like Typeform for free?",
      a: "Use a free builder with one-question-at-a-time forms. On Formloom: create a free account, add your questions, add logic and a theme, publish, then share the link, QR code or embed code. It's free for 1,000 responses a month.",
    },
    {
      q: "What is a one-question-at-a-time form called?",
      a: "Usually a conversational form. Each question fills the screen, and people answer and press Enter to move on. Typeform made the style popular.",
    },
    {
      q: "Can I embed a Typeform-style form on my website for free?",
      a: "Yes. Formloom gives you inline, full-page and popup embed codes on the free plan. Paste them into any HTML page, Webflow, WordPress or Notion.",
    },
    {
      q: "Do I need to code to make a conversational form?",
      a: "No. You build it in the editor. Developers can also use Formloom's REST API, signed webhooks, or hand the setup prompt to an AI coding agent.",
    },
  ],
  body: `
**You can build a Typeform-style form for free in about five minutes.** The steps below use [Formloom](/typeform-alternative), a free, open-source Typeform alternative. Its free plan includes 1,000 responses a month with every feature, and you don't need a credit card.

## Step 1: Create a free account

Go to [formloom.app](/signup) and sign up with email or Google.

## Step 2: Pick a template or start blank

Templates include customer feedback (NPS), event registration, lead generation, job application, product research and a personality quiz. Each comes with questions, logic and a theme already set, so you can publish it as is or edit it.

## Step 3: Add your questions

Click **Add question** and pick a type. There are 16: short text, long text, email, phone, website, number, multiple choice, picture choice, dropdown, yes/no, legal, rating, opinion scale, Net Promoter Score, date and statement. Each question gets its own full screen when someone fills in the form.

**Tip:** type \`@\` in a question to reuse an earlier answer, like "Great to meet you, @name."

## Step 4: Add logic

Open the **Logic** tab on a question to jump somewhere based on an answer. For example, if the NPS score is 6 or below, ask "What should we fix first?"; otherwise ask "What do you like most?". Rules can combine and/or conditions, and you can send people to different endings.

## Step 5: Make it look like your brand

In **Design**, pick one of 9 theme presets and one of 12 Google Fonts, or set your own colors and background image.

## Step 6: Publish and share

Click **Publish**. Then on **Share** you get:

- a link to send anywhere,
- a QR code,
- embed code (inline, full page or popup) for your site.

## Step 7: Read the results

**Results** shows views, starts, submissions, completion rate, average time, drop-off by question and an NPS breakdown. You can export everything as CSV, or send each response to your app with a signed webhook.

## How is this different from using Typeform for free?

Typeform's free plan allows 10 responses a month and you can't remove its branding. Formloom's free plan allows 1,000 responses a month. Pro is $6/month billed yearly for unlimited responses and no badge, or you can [self-host it](/blog/self-hosted-form-builder) for free. Read [Is Typeform free?](/blog/is-typeform-free) for the details.
`,
};

export default post;
