export type Post = {
  slug: string;
  title: string;
  /** Meta description, ~155 characters. */
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  updated?: string;
  keywords: string[];
  /** A direct two or three sentence answer, shown first and quoted by search engines and LLMs. */
  tldr: string;
  faq: { q: string; a: string }[];
  /** Markdown. */
  body: string;
};
