// Core form model. Shared by the builder, the player, the API and storage.

export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "multiple_choice"
  | "picture_choice"
  | "dropdown"
  | "yes_no"
  | "rating"
  | "opinion_scale"
  | "nps"
  | "date"
  | "legal"
  | "statement";

export type Choice = { id: string; label: string; imageUrl?: string };

export type AttachmentLayout = "stack" | "split-right" | "split-left" | "wallpaper";

export type Attachment = { url: string; layout: AttachmentLayout; alt?: string };

export type ConditionOp =
  | "is"
  | "is_not"
  | "contains"
  | "not_contains"
  | "gt"
  | "lt"
  | "answered"
  | "not_answered";

export type Condition = { fieldId: string; op: ConditionOp; value?: string };

export type LogicRule = {
  id: string;
  combinator: "and" | "or";
  conditions: Condition[];
  /** Field id or ending id. */
  to: string;
};

export type FieldProperties = {
  placeholder?: string;
  buttonText?: string;
  // choices
  choices?: Choice[];
  allowMultiple?: boolean;
  allowOther?: boolean;
  randomize?: boolean;
  minSelections?: number;
  maxSelections?: number;
  // text
  maxLength?: number;
  // number
  min?: number;
  max?: number;
  // rating / scale
  steps?: number;
  start?: 0 | 1;
  shape?: "star" | "heart" | "circle";
  labelLeft?: string;
  labelCenter?: string;
  labelRight?: string;
  // date
  dateFormat?: "MDY" | "DMY" | "YMD";
};

export type Field = {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  required: boolean;
  properties: FieldProperties;
  attachment?: Attachment;
  logic?: LogicRule[];
  /** Where to go when no rule matches. Undefined means "next field". */
  fallbackTo?: string;
};

export type WelcomeScreen = {
  enabled: boolean;
  title: string;
  description?: string;
  buttonText: string;
  attachment?: Attachment;
};

export type Ending = {
  id: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  redirectUrl?: string;
  attachment?: Attachment;
};

export type Theme = {
  preset?: string;
  font: string;
  background: string;
  question: string;
  answer: string;
  button: string;
  buttonText: string;
  backgroundImage?: string;
  backgroundOverlay?: number; // 0..1
  radius: "none" | "small" | "large" | "pill";
  align: "left" | "center";
};

export type FormSettings = {
  showProgress: boolean;
  showNumbers: boolean;
  allowBack: boolean;
  showBranding: boolean;
  isClosed: boolean;
  closedMessage: string;
  responseLimit?: number;
  closeAt?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  hiddenFields: string[];
  language: string;
};

export type FormDefinition = {
  title: string;
  welcome: WelcomeScreen;
  fields: Field[];
  endings: Ending[];
  theme: Theme;
  settings: FormSettings;
};

export type AnswerValue = string | number | boolean | string[] | null;

export type Answers = Record<string, AnswerValue>;

// ---------------------------------------------------------------------------

export function uid(prefix = ""): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(10);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return prefix ? `${prefix}_${out}` : out;
}

export const FIELD_META: Record<
  FieldType,
  { label: string; group: "Text" | "Choice" | "Rating" | "Other"; color: string; hint: string }
> = {
  short_text: { label: "Short text", group: "Text", color: "#3b82f6", hint: "One line answer" },
  long_text: { label: "Long text", group: "Text", color: "#3b82f6", hint: "Paragraphs" },
  email: { label: "Email", group: "Text", color: "#0ea5e9", hint: "Validated email" },
  phone: { label: "Phone number", group: "Text", color: "#0ea5e9", hint: "Digits and +" },
  url: { label: "Website", group: "Text", color: "#0ea5e9", hint: "Validated link" },
  number: { label: "Number", group: "Text", color: "#06b6d4", hint: "With min / max" },
  multiple_choice: { label: "Multiple choice", group: "Choice", color: "#8b5cf6", hint: "Pick one or many" },
  picture_choice: { label: "Picture choice", group: "Choice", color: "#a855f7", hint: "Choices with images" },
  dropdown: { label: "Dropdown", group: "Choice", color: "#7c3aed", hint: "Searchable long lists" },
  yes_no: { label: "Yes / No", group: "Choice", color: "#d946ef", hint: "Two buttons" },
  legal: { label: "Legal", group: "Choice", color: "#c026d3", hint: "Accept terms" },
  rating: { label: "Rating", group: "Rating", color: "#f59e0b", hint: "Stars, hearts" },
  opinion_scale: { label: "Opinion scale", group: "Rating", color: "#f97316", hint: "Numbered scale" },
  nps: { label: "Net Promoter Score®", group: "Rating", color: "#ef4444", hint: "0–10 with NPS score" },
  date: { label: "Date", group: "Other", color: "#10b981", hint: "Day, month, year" },
  statement: { label: "Statement", group: "Other", color: "#64748b", hint: "Text, no answer" },
};

export const FIELD_TYPES = Object.keys(FIELD_META) as FieldType[];

export const isChoiceType = (t: FieldType) =>
  t === "multiple_choice" || t === "picture_choice" || t === "dropdown";

export function defaultProperties(type: FieldType): FieldProperties {
  switch (type) {
    case "multiple_choice":
      return {
        choices: [
          { id: uid("c"), label: "Choice 1" },
          { id: uid("c"), label: "Choice 2" },
        ],
        allowMultiple: false,
        allowOther: false,
        randomize: false,
      };
    case "picture_choice":
      return {
        choices: [
          { id: uid("c"), label: "Option A" },
          { id: uid("c"), label: "Option B" },
        ],
        allowMultiple: false,
      };
    case "dropdown":
      return {
        choices: [
          { id: uid("c"), label: "Option 1" },
          { id: uid("c"), label: "Option 2" },
          { id: uid("c"), label: "Option 3" },
        ],
      };
    case "rating":
      return { steps: 5, shape: "star" };
    case "opinion_scale":
      return { steps: 10, start: 1, labelLeft: "", labelCenter: "", labelRight: "" };
    case "nps":
      return { labelLeft: "Not likely", labelRight: "Extremely likely" };
    case "date":
      return { dateFormat: "MDY" };
    case "statement":
      return { buttonText: "Continue" };
    case "long_text":
      return { placeholder: "Type your answer here..." };
    case "short_text":
      return { placeholder: "Type your answer here..." };
    case "email":
      return { placeholder: "name@example.com" };
    case "phone":
      return { placeholder: "+1 555 000 0000" };
    case "url":
      return { placeholder: "https://" };
    case "number":
      return { placeholder: "Type a number..." };
    default:
      return {};
  }
}

const DEFAULT_TITLES: Partial<Record<FieldType, string>> = {
  short_text: "What's your name?",
  long_text: "Tell us a bit more",
  email: "What's your email address?",
  phone: "What's your phone number?",
  url: "What's your website?",
  number: "How many?",
  multiple_choice: "Which option fits best?",
  picture_choice: "Pick the one you like",
  dropdown: "Choose an option",
  yes_no: "Are you in?",
  legal: "Do you accept the terms and conditions?",
  rating: "How would you rate us?",
  opinion_scale: "How strongly do you agree?",
  nps: "How likely are you to recommend us to a friend or colleague?",
  date: "When is a good date?",
  statement: "Thanks! Just a few more questions.",
};

export function createField(type: FieldType): Field {
  return {
    id: uid("f"),
    type,
    title: DEFAULT_TITLES[type] ?? "Your question here",
    required: type !== "statement",
    properties: defaultProperties(type),
  };
}

/** Change a field's type while keeping whatever content still makes sense. */
export function convertField(field: Field, type: FieldType): Field {
  const next: Field = { ...field, type, properties: defaultProperties(type) };
  if (isChoiceType(field.type) && isChoiceType(type) && field.properties.choices) {
    next.properties.choices = field.properties.choices;
  }
  if (type === "statement") next.required = false;
  next.logic = (field.logic ?? []).filter(() => type !== "statement");
  return next;
}

export const THEME_PRESETS: Record<string, Theme & { name: string }> = {
  paper: {
    name: "Paper",
    font: "Inter",
    background: "#fbfaf7",
    question: "#1c1b17",
    answer: "#3a5bd9",
    button: "#1c1b17",
    buttonText: "#fbfaf7",
    radius: "small",
    align: "left",
  },
  paperDark: {
    name: "Paper Dark",
    font: "Inter",
    background: "#0b0b0a",
    question: "#efeee9",
    answer: "#ff5b2e",
    button: "#ff5b2e",
    buttonText: "#ffffff",
    radius: "pill",
    align: "left",
  },
  midnight: {
    name: "Midnight",
    font: "Space Grotesk",
    background: "#0f1117",
    question: "#f4f4f5",
    answer: "#a5b4fc",
    button: "#6366f1",
    buttonText: "#ffffff",
    radius: "small",
    align: "left",
  },
  forest: {
    name: "Forest",
    font: "Fraunces",
    background: "#16301f",
    question: "#f3efe0",
    answer: "#e8c872",
    button: "#e8c872",
    buttonText: "#16301f",
    radius: "large",
    align: "left",
  },
  peach: {
    name: "Peach",
    font: "DM Sans",
    background: "#ffe9dc",
    question: "#3d1f12",
    answer: "#c2410c",
    button: "#c2410c",
    buttonText: "#fff7f0",
    radius: "pill",
    align: "left",
  },
  ocean: {
    name: "Ocean",
    font: "Manrope",
    background: "#0b3b5c",
    question: "#ffffff",
    answer: "#7dd3fc",
    button: "#ffffff",
    buttonText: "#0b3b5c",
    radius: "small",
    align: "left",
  },
  lilac: {
    name: "Lilac",
    font: "Outfit",
    background: "#efe9ff",
    question: "#2b1a5c",
    answer: "#6d28d9",
    button: "#6d28d9",
    buttonText: "#ffffff",
    radius: "large",
    align: "center",
  },
  mono: {
    name: "Mono",
    font: "IBM Plex Mono",
    background: "#ffffff",
    question: "#000000",
    answer: "#000000",
    button: "#000000",
    buttonText: "#ffffff",
    radius: "none",
    align: "left",
  },
  sunset: {
    name: "Sunset",
    font: "Playfair Display",
    background: "#2a1325",
    question: "#ffe8d6",
    answer: "#ff8f6b",
    button: "#ff8f6b",
    buttonText: "#2a1325",
    radius: "small",
    align: "left",
  },
};

export const FONTS = [
  "Inter",
  "DM Sans",
  "Manrope",
  "Outfit",
  "Space Grotesk",
  "Work Sans",
  "Karla",
  "Fraunces",
  "Playfair Display",
  "Lora",
  "IBM Plex Mono",
  "Syne",
];

export function presetTheme(key: string): Theme {
  const { name: _name, ...rest } = THEME_PRESETS[key] ?? THEME_PRESETS.paper;
  void _name;
  return { ...rest, preset: key };
}

export function defaultSettings(): FormSettings {
  return {
    showProgress: true,
    showNumbers: true,
    allowBack: true,
    showBranding: true,
    isClosed: false,
    closedMessage: "This form is no longer accepting responses.",
    hiddenFields: [],
    language: "en",
  };
}

export function defaultEnding(): Ending {
  return {
    id: uid("end"),
    title: "Thanks for completing this form!",
    description: "Your response has been recorded.",
  };
}

export function blankForm(title = "Untitled form"): FormDefinition {
  return {
    title,
    welcome: {
      enabled: true,
      title: "Hey there 👋",
      description: "This takes about a minute.",
      buttonText: "Start",
    },
    fields: [createField("short_text")],
    endings: [defaultEnding()],
    theme: presetTheme("paper"),
    settings: defaultSettings(),
  };
}

/** Fill in anything missing so older/imported definitions stay valid. */
export function normalizeDefinition(input: Partial<FormDefinition>): FormDefinition {
  const base = blankForm();
  return {
    title: input.title ?? base.title,
    welcome: { ...base.welcome, ...(input.welcome ?? {}) },
    fields: (input.fields ?? []).map((f) => ({
      ...f,
      properties: { ...defaultProperties(f.type), ...(f.properties ?? {}) },
      required: Boolean(f.required),
    })),
    endings: input.endings && input.endings.length ? input.endings : base.endings,
    theme: { ...base.theme, ...(input.theme ?? {}) },
    settings: { ...base.settings, ...(input.settings ?? {}) },
  };
}

export const ANSWERABLE = (t: FieldType) => t !== "statement";
