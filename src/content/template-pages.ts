/**
 * Search landing pages for each template: /templates/<slug>.
 * Each targets one "<thing> template" / "free <thing> form" search and leads to a one-click copy of the form.
 */
export type TemplatePage = {
  slug: string;
  /** Key in src/lib/templates.ts. */
  template: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  /** Two-sentence direct answer shown first. */
  answer: string;
  /** What's inside, one line per question or feature. */
  inside: string[];
  uses: string[];
  faq: { q: string; a: string }[];
};

const COMMON_FAQ = [
  {
    q: "Is this template really free?",
    a: "Yes. Copy it into a free Formloom account and collect up to 1,000 responses a month with every feature. Pro is $6 a month for unlimited responses, and the open-source version is free with no limits when you self-host.",
  },
  {
    q: "Can I change the questions, colours and fonts?",
    a: "Everything is editable: questions, logic, welcome and ending screens, and the theme. Pick from 8 theme presets or set your own colours, font and background image.",
  },
];

export const TEMPLATE_PAGES: TemplatePage[] = [
  {
    slug: "nps-survey-template",
    template: "nps",
    title: "Free NPS survey template (with follow-up logic)",
    h1: "Free NPS survey template",
    description:
      "A free Net Promoter Score survey template that asks a different follow-up to detractors and promoters. Try it live, then copy it in one click.",
    keywords: ["nps survey template", "free nps survey", "net promoter score survey template", "nps form", "nps survey tool free"],
    answer:
      "This NPS survey asks the standard 0–10 \"How likely are you to recommend us?\" question, then branches: scores under 7 are asked what to fix first, everyone else what they like most. Results show your NPS score with the promoter, passive and detractor split automatically.",
    inside: [
      "0–10 Net Promoter Score question",
      "Logic: detractors (0–6) get \"What should we fix first?\"",
      "Promoters and passives get \"What do you like most?\"",
      "Optional email for follow-up",
      "Product name filled in from the link (?product=…)",
    ],
    uses: ["Quarterly customer pulse", "After onboarding or a support ticket", "Product-market fit checks", "Employee NPS (eNPS)"],
    faq: [
      {
        q: "How is NPS calculated?",
        a: "NPS is the percentage of promoters (scores 9–10) minus the percentage of detractors (0–6). Passives (7–8) count toward the total but not either group. Formloom calculates it for you in Results.",
      },
      {
        q: "What's a good NPS score?",
        a: "Anything above 0 means you have more promoters than detractors. Above 30 is generally good and above 50 is excellent, but compare against your own past scores more than against other industries.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "customer-satisfaction-survey-template",
    template: "csat",
    title: "Free customer satisfaction (CSAT) survey template",
    h1: "Free customer satisfaction survey template",
    description:
      "A free CSAT survey template: a 1–5 rating that branches to \"what went well\" or \"what should we fix\", plus a would-you-come-back question.",
    keywords: ["customer satisfaction survey template", "csat survey template", "free customer feedback form", "customer feedback survey template"],
    answer:
      "This customer satisfaction survey starts with a 1–5 star rating. Low ratings are asked what to fix first and happy customers what they liked, then everyone answers whether they'd use you again.",
    inside: [
      "1–5 star satisfaction rating",
      "Logic: ratings of 1–3 get \"What should we fix first?\"",
      "Ratings of 4–5 get \"What did you like most?\"",
      "Yes/no: would you use us again?",
    ],
    uses: ["After a purchase or delivery", "After a support conversation", "End of a project or engagement", "Restaurant, salon or event feedback"],
    faq: [
      {
        q: "What's the difference between CSAT and NPS?",
        a: "CSAT measures how satisfied someone is with one interaction, usually on a 1–5 scale. NPS measures loyalty: how likely they are to recommend you overall. Use CSAT right after a moment, NPS every few months.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "event-registration-form-template",
    template: "event",
    title: "Free event registration & RSVP form template",
    h1: "Free event registration form template",
    description:
      "A free event RSVP form template that asks about dietary needs and plus-ones, and shows a different ending to people who can't make it.",
    keywords: ["event registration form template", "rsvp form template", "free rsvp form", "event signup form", "party rsvp form"],
    answer:
      "This event registration form collects a name and email, asks if the person is coming, then asks about dietary needs and how many guests they're bringing. People who can't make it skip to a friendly \"we'll miss you\" ending.",
    inside: ["Name, then email with the name recalled", "Yes/no RSVP with logic", "Dietary requirements", "Number of guests", "Separate endings for yes and no"],
    uses: ["Meetups and conferences", "Weddings and parties", "Webinars", "Workshops and classes"],
    faq: [
      {
        q: "Can I close registration when the event is full?",
        a: "Yes. Set a response limit or a closing date in the form's settings and Formloom closes the form automatically with your own message.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "lead-generation-form-template",
    template: "lead",
    title: "Free lead generation form template",
    h1: "Free lead generation form template",
    description:
      "A free lead capture form template that qualifies leads by team size and budget, greets them by name, and sends every lead to your CRM by webhook.",
    keywords: ["lead generation form template", "lead capture form", "free lead form", "lead qualification form", "contact sales form"],
    answer:
      "This lead generation form asks one question at a time, greets the visitor by name, and qualifies them by team size and monthly budget before asking for an email. Conversational forms like this tend to get finished more often than a long single-page form.",
    inside: ["Name, then a personalised greeting", "Company", "Team size", "Monthly budget", "Work email"],
    uses: ["Agency and freelancer enquiries", "\"Talk to sales\" on a SaaS site", "Demo requests", "Quote requests"],
    faq: [
      {
        q: "Can I send leads to my CRM?",
        a: "Yes. Add a webhook URL and each submission is sent as signed JSON, so you can pipe it into HubSpot, Pipedrive, Airtable or Slack with a webhook tool like Zapier, Make or n8n, or your own endpoint.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "job-application-form-template",
    template: "job",
    title: "Free job application form template",
    h1: "Free job application form template",
    description:
      "A free job application form template with a portfolio link, experience, tools, a cover note, start date and data consent. Embed it on your careers page.",
    keywords: ["job application form template", "free job application form", "employment application form", "hiring form template", "careers form"],
    answer:
      "This job application form collects the candidate's name, email, portfolio link, years of experience, daily tools, a short cover note, start date and consent to store their data, one question at a time. Embed it on your careers page or share the link in your job post.",
    inside: ["Name and email", "Portfolio link", "Years of experience (scale)", "Tools used daily", "Why this role (cover note)", "Start date", "Data consent"],
    uses: ["Startup and small-team hiring", "Internship applications", "Volunteer signups", "Freelancer intake"],
    faq: [
      {
        q: "Can candidates upload a CV?",
        a: "Not yet: Formloom has no file-upload question. Most teams ask for a link to a CV, portfolio or LinkedIn profile instead.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "product-feedback-survey-template",
    template: "product",
    title: "Free product feedback survey template",
    h1: "Free product feedback survey template",
    description:
      "A free product feedback survey template: an overall rating, most-used feature, ease of getting started and the one thing to change. Quick to finish.",
    keywords: ["product feedback survey template", "product survey template", "user research survey", "feature feedback form", "product feedback form"],
    answer:
      "This product feedback survey asks for an overall rating, the feature people use most, how easy it was to get started and the one thing they'd change. It's shown one question at a time, so it feels quick.",
    inside: ["Overall rating (stars)", "Most-used feature", "Ease of getting started (scale)", "The one thing they'd change"],
    uses: ["Feature discovery", "Beta feedback", "Churn interviews", "Roadmap prioritisation"],
    faq: [...COMMON_FAQ],
  },
  {
    slug: "contact-form-template",
    template: "contact",
    title: "Free contact form template (conversational)",
    h1: "Free contact form template",
    description:
      "A free contact form template that feels like a conversation: name, email, topic and message. Embed it on any site with one line of code.",
    keywords: ["contact form template", "free contact form", "contact us form", "website contact form", "contact form for website free"],
    answer:
      "This contact form asks for a name, email, topic and message one step at a time, and greets the visitor by name. Embed it with an iframe or a popup button, and get each message by webhook or in your Formloom inbox.",
    inside: ["Name", "Email, with the visitor's name recalled", "Topic: question, sales, support, partnership", "Message"],
    uses: ["Small business websites", "Portfolios", "SaaS support pages", "Static sites with no backend"],
    faq: [
      {
        q: "How do I add it to my website?",
        a: "Paste an iframe where the form should appear, or add one script tag and a button to open it as a popup. Both snippets are on the form's Share page.",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "waitlist-form-template",
    template: "waitlist",
    title: "Free waitlist form template for launches",
    h1: "Free waitlist form template",
    description:
      "A free waitlist and early-access signup form template: email, role and use case. 1,000 free signups a month, with a webhook to your email tool.",
    keywords: ["waitlist form template", "waitlist form", "early access signup form", "free waitlist", "beta signup form"],
    answer:
      "This waitlist form collects an email, what the person does and what they'd use your product for, so you know who to invite first. It's free for up to 1,000 signups a month on Formloom's hosted plan.",
    inside: ["Email", "Role: founder, developer, designer, marketer…", "Use case (optional)"],
    uses: ["Pre-launch landing pages", "Beta programmes", "Product Hunt launches", "Course or newsletter interest"],
    faq: [
      {
        q: "What happens if more than 1,000 people join in a month?",
        a: "The form keeps working and every signup is saved. On the free plan the extra signups are held and appear as soon as you upgrade to Pro ($6 a month).",
      },
      ...COMMON_FAQ,
    ],
  },
  {
    slug: "personality-quiz-template",
    template: "quiz",
    title: "Free personality quiz template (with results)",
    h1: "Free personality quiz template",
    description:
      "A free personality quiz template with picture choices that route to different results screens. Make a shareable \"which one are you?\" quiz in minutes.",
    keywords: ["personality quiz template", "quiz maker free", "buzzfeed style quiz maker", "which are you quiz", "picture quiz template"],
    answer:
      "This quiz uses a picture-choice question and logic jumps to send each answer to its own result screen. Add more questions and results to build a full \"which one are you?\" quiz for social or lead generation.",
    inside: ["Picture-choice question", "Logic jumps to three different endings", "Shareable result screens"],
    uses: ["Social media engagement", "Product recommenders", "Lead magnets", "Classroom quizzes"],
    faq: [...COMMON_FAQ],
  },
];

export const getTemplatePage = (slug: string) => TEMPLATE_PAGES.find((t) => t.slug === slug);
