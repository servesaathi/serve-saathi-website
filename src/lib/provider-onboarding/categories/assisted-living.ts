import type { CategoryForm } from "../types";

// "Serve Saathi — Provider Onboarding — Assisted Living" (Google Form, from
// the exported PDF — the live form link is not publicly readable).
export const ASSISTED_LIVING: CategoryForm = {
  slug: "assisted-living",
  backendCategorySlug: "assisted-living",
  title: "Assisted Living",
  blurb: "Residential communities with help for daily activities, nursing or memory care.",
  sections: [
    {
      id: "assistedLiving",
      title: "Assisted living details",
      fields: [
        {
          id: "vacancy",
          label: "Do you currently have vacancies?",
          type: "radio",
          required: true,
          options: ["Immediate vacancy", "Available within 1 week", "No current vacancy"],
        },
        {
          id: "costMin",
          label: "Starting monthly cost per resident (₹)",
          type: "text",
          required: true,
          placeholder: "e.g. 45000",
        },
        {
          id: "costMax",
          label: "Highest monthly cost per resident (₹)",
          type: "text",
          helperText: "If you offer multiple room/care tiers.",
          placeholder: "e.g. 90000",
        },
        {
          id: "careLevel",
          label: "What level of care do you provide?",
          type: "checkbox",
          required: true,
          options: [
            "Independent living support",
            "Help with daily activities (bathing, dressing, mobility)",
            "Full-time nursing care",
            "Memory care support",
          ],
        },
        {
          id: "facilityFor",
          label: "Your facility is for",
          type: "radio",
          required: true,
          options: ["Men only", "Women only", "Both men and women"],
        },
      ],
    },
  ],
};
