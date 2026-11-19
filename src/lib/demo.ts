import { createField, defaultSettings, presetTheme, uid, type FormDefinition } from "./schema";

export function demoForm(): FormDefinition {
  const name = { ...createField("short_text"), id: "f_demo_name", title: "Hi! What should we call you?" };
  const role = {
    ...createField("multiple_choice"),
    title: `Nice to meet you, {{field:${name.id}}}. What brings you here?`,
    properties: {
      choices: [
        { id: uid("c"), label: "Collecting feedback" },
        { id: uid("c"), label: "Running surveys & research" },
        { id: uid("c"), label: "Lead generation" },
        { id: uid("c"), label: "Just exploring" },
      ],
    },
  };
  const rating = { ...createField("rating"), title: "How much do you enjoy filling in forms, usually?" };
  return {
    title: "Formloom demo",
    welcome: { enabled: false, title: "", buttonText: "Start" },
    fields: [name, role, rating],
    endings: [
      {
        id: uid("end"),
        title: "That was painless, right {{field:f_demo_name}}?",
        description: "Every form you build with Formloom feels like this.",
        buttonText: "Build your own",
        buttonUrl: "/signup",
      },
    ],
    theme: { ...presetTheme("forest") },
    settings: { ...defaultSettings(), showBranding: false },
  };
}
