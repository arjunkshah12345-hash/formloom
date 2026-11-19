import {
  blankForm,
  createField,
  defaultEnding,
  defaultSettings,
  presetTheme,
  uid,
  type Field,
  type FieldType,
  type FormDefinition,
} from "./schema";

function field(type: FieldType, title: string, extra: Partial<Field> = {}): Field {
  const f = createField(type);
  return {
    ...f,
    title,
    ...extra,
    properties: { ...f.properties, ...(extra.properties ?? {}) },
  };
}

const choices = (...labels: string[]) => labels.map((label) => ({ id: uid("c"), label }));

export type Template = {
  key: string;
  name: string;
  description: string;
  build: () => FormDefinition;
};

export const TEMPLATES: Template[] = [
  {
    key: "blank",
    name: "Start from scratch",
    description: "A clean slate with one question.",
    build: () => blankForm(),
  },
  {
    key: "nps",
    name: "Customer feedback (NPS)",
    description: "Net Promoter Score with follow-ups that branch on the score.",
    build: () => {
      const nps = field("nps", "How likely are you to recommend {{hidden:product}} to a friend?");
      const low = field("long_text", "Sorry to hear that. What's the one thing we should fix first?");
      const high = field("long_text", "Love it! What do you like most?");
      const email = field("email", "Can we follow up with you? Leave your email.", { required: false });
      nps.logic = [
        {
          id: uid("r"),
          combinator: "and",
          conditions: [{ fieldId: nps.id, op: "lt", value: "7" }],
          to: low.id,
        },
      ];
      nps.fallbackTo = high.id;
      low.fallbackTo = email.id;
      return {
        title: "Customer feedback",
        welcome: {
          enabled: true,
          title: "Got 30 seconds? 🙏",
          description: "Your feedback shapes what we build next.",
          buttonText: "Let's go",
        },
        fields: [nps, low, high, email],
        endings: [{ ...defaultEnding(), title: "Thank you!", description: "We read every single response." }],
        theme: presetTheme("midnight"),
        settings: { ...defaultSettings(), hiddenFields: ["product"] },
      };
    },
  },
  {
    key: "event",
    name: "Event registration",
    description: "Collect RSVPs, dietary needs and plus-ones.",
    build: () => {
      const name = field("short_text", "First things first — what's your name?");
      const email = field("email", `Great to meet you, {{field:${name.id}}}. What's your email?`);
      const attending = field("yes_no", "Will you be joining us in person?");
      const diet = field("multiple_choice", "Any dietary requirements?", {
        required: false,
        properties: {
          choices: choices("None", "Vegetarian", "Vegan", "Gluten free", "Halal"),
          allowMultiple: true,
          allowOther: true,
        },
      });
      const guests = field("number", "How many guests are you bringing?", {
        properties: { min: 0, max: 4 },
      });
      const sorry = { ...defaultEnding(), title: "We'll miss you!", description: "We'll send you the recording." };
      const yay = { ...defaultEnding(), title: "You're on the list 🎉", description: "A calendar invite is on its way." };
      attending.logic = [
        {
          id: uid("r"),
          combinator: "and",
          conditions: [{ fieldId: attending.id, op: "is", value: "no" }],
          to: sorry.id,
        },
      ];
      return {
        title: "Event registration",
        welcome: {
          enabled: true,
          title: "Summer Meetup 2026",
          description: "Join us for talks, food and good company. RSVP below.",
          buttonText: "RSVP",
        },
        fields: [name, email, attending, diet, guests],
        endings: [yay, sorry],
        theme: presetTheme("peach"),
        settings: defaultSettings(),
      };
    },
  },
  {
    key: "lead",
    name: "Lead generation",
    description: "Qualify inbound leads by company size and budget.",
    build: () => {
      const name = field("short_text", "What's your name?");
      const company = field("short_text", `Nice to meet you {{field:${name.id}}}! Where do you work?`);
      const size = field("multiple_choice", "How big is the team?", {
        properties: { choices: choices("Just me", "2–10", "11–50", "51–200", "200+") },
      });
      const budget = field("dropdown", "What's your monthly budget?", {
        properties: { choices: choices("< $500", "$500 – $2k", "$2k – $10k", "$10k+") },
      });
      const email = field("email", "Where should we send the proposal?");
      return {
        title: "Work with us",
        welcome: {
          enabled: true,
          title: "Let's build something great",
          description: "Tell us about your project — it takes 1 minute.",
          buttonText: "Get started",
        },
        fields: [name, company, size, budget, email],
        endings: [{ ...defaultEnding(), title: "Thanks! We'll be in touch within 24h." }],
        theme: presetTheme("ocean"),
        settings: defaultSettings(),
      };
    },
  },
  {
    key: "job",
    name: "Job application",
    description: "Screen candidates with links, experience and a cover note.",
    build: () => ({
      title: "Job application",
      welcome: {
        enabled: true,
        title: "Join the team",
        description: "We're hiring a Product Designer. Tell us about yourself.",
        buttonText: "Apply",
      },
      fields: [
        field("short_text", "What's your full name?"),
        field("email", "Your email address"),
        field("url", "Link to your portfolio"),
        field("opinion_scale", "How many years of design experience do you have?", {
          properties: { steps: 10, start: 0, labelLeft: "New", labelRight: "Veteran" },
        }),
        field("multiple_choice", "Which tools do you use daily?", {
          properties: {
            choices: choices("Figma", "Framer", "Sketch", "Adobe CC", "Code"),
            allowMultiple: true,
          },
        }),
        field("long_text", "Why do you want to work with us?", { properties: { maxLength: 1500 } }),
        field("date", "When could you start?"),
        field("legal", "Can we store your data for the hiring process?"),
      ],
      endings: [{ ...defaultEnding(), title: "Application received", description: "We review every application within a week." }],
      theme: presetTheme("paper"),
      settings: defaultSettings(),
    }),
  },
  {
    key: "product",
    name: "Product research",
    description: "Ratings, scales and open questions for product discovery.",
    build: () => ({
      title: "Product survey",
      welcome: {
        enabled: true,
        title: "Help us shape the roadmap",
        description: "Five quick questions.",
        buttonText: "Start",
      },
      fields: [
        field("rating", "How would you rate the product overall?"),
        field("multiple_choice", "Which feature do you use most?", {
          properties: { choices: choices("Dashboards", "Reports", "Integrations", "Mobile app"), allowOther: true },
        }),
        field("opinion_scale", "How easy is it to get started?", {
          properties: { steps: 5, start: 1, labelLeft: "Very hard", labelRight: "Very easy" },
        }),
        field("statement", "Almost done! One last thing.", { required: false }),
        field("long_text", "If you could change one thing, what would it be?", { required: false }),
      ],
      endings: [{ ...defaultEnding(), title: "You're a star ⭐", description: "Thanks for helping us improve." }],
      theme: presetTheme("lilac"),
      settings: defaultSettings(),
    }),
  },
  {
    key: "quiz",
    name: "Personality quiz",
    description: "Picture choices that route to different results.",
    build: () => {
      const vibe = field("picture_choice", "Pick your ideal weekend", {
        properties: {
          choices: [
            { id: uid("c"), label: "Mountains", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=70" },
            { id: uid("c"), label: "Beach", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70" },
            { id: uid("c"), label: "City", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=70" },
          ],
        },
      });
      const explorer = { ...defaultEnding(), title: "You're an Explorer 🏔️", description: "Fresh air and big views recharge you." };
      const relaxer = { ...defaultEnding(), title: "You're a Relaxer 🌊", description: "Sun, sand and a good book." };
      const urbanite = { ...defaultEnding(), title: "You're an Urbanite 🏙️", description: "Energy, food and culture." };
      const [m, b] = vibe.properties.choices!;
      vibe.logic = [
        { id: uid("r"), combinator: "and", conditions: [{ fieldId: vibe.id, op: "is", value: m.id }], to: explorer.id },
        { id: uid("r"), combinator: "and", conditions: [{ fieldId: vibe.id, op: "is", value: b.id }], to: relaxer.id },
      ];
      vibe.fallbackTo = urbanite.id;
      return {
        title: "What's your travel style?",
        welcome: {
          enabled: true,
          title: "What's your travel style?",
          description: "One question. Instant result.",
          buttonText: "Find out",
        },
        fields: [vibe],
        endings: [explorer, relaxer, urbanite],
        theme: presetTheme("forest"),
        settings: defaultSettings(),
      };
    },
  },
];
