import type { CategoryForm } from "../types";

// "Serve Saathi — Provider Onboarding — Day Care Centres" (Google Form).
// The three pricing pages in the form are branches off "How do you charge"
// — here they're sections gated by that answer.
export const DAY_CARE: CategoryForm = {
  slug: "day-care-centres",
  title: "Day Care Centres",
  blurb: "Daytime care, activities and meals for seniors who go home in the evening.",
  sections: [
    {
      id: "dayCare",
      title: "Day care centre details",
      fields: [
        {
          id: "pricingModel",
          label: "How do you charge for your services?",
          type: "radio",
          required: true,
          options: ["Monthly membership", "Per-day drop-in", "Both"],
        },
        {
          id: "monthlyMin",
          label: "Starting monthly cost (₹)",
          type: "text",
          required: true,
          placeholder: "e.g. 15000",
          showIf: { field: "pricingModel", in: ["Monthly membership", "Both"] },
        },
        {
          id: "monthlyMax",
          label: "Highest monthly cost (₹)",
          type: "text",
          required: true,
          placeholder: "e.g. 30000",
          showIf: { field: "pricingModel", in: ["Monthly membership", "Both"] },
        },
        {
          id: "perDay",
          label: "Per-day cost (₹)",
          type: "text",
          required: true,
          placeholder: "e.g. 800",
          showIf: { field: "pricingModel", in: ["Per-day drop-in", "Both"] },
        },
        {
          id: "services",
          label: "What activities/services do you offer?",
          type: "checkbox",
          required: true,
          options: ["Physiotherapy", "Recreational activities", "Medical monitoring", "Meals", "Other"],
        },
        {
          id: "transport",
          label: "Do you provide pickup/drop transport?",
          type: "radio",
          required: true,
          options: ["Yes", "No"],
        },
      ],
    },
  ],
};
