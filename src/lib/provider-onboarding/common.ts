import type { Section } from "./types";

// Shared by every provider category form — the first two pages of the
// Google Form ("Common Provider Information" and "Trust & Verification
// (MVP minimum)").

const CITIES = ["Gurugram", "Noida", "New Delhi", "Faridabad", "Ghaziabad", "Other"];

const LOCALITIES = [
  "DLF Phase 1",
  "DLF Phase 2",
  "DLF Phase 3",
  "Sector 14 (Gurugram)",
  "Sector 56 (Gurugram)",
  "Golf Course Road",
  "Sohna Road",
  "Sector 18 (Noida)",
  "Sector 50 (Noida)",
  "Sector 62 (Noida)",
  "Sector 76 (Noida)",
  "Sector 137 (Noida)",
  "Dwarka",
  "Vasant Kunj",
  "Rohini",
  "Saket",
  "Karol Bagh",
  "Sector 15 (Faridabad)",
  "Sector 21 (Faridabad)",
  "Old Faridabad",
  "Indirapuram",
  "Vaishali",
  "Raj Nagar Extension",
  "Other",
];

export const COMMON_SECTIONS: Section[] = [
  {
    id: "common",
    title: "Common provider information",
    description:
      "This information applies to your facility and is collected the same way for every Serve Saathi provider.",
    fields: [
      { id: "facilityName", label: "Facility name", type: "text", required: true },
      { id: "address", label: "Full address", type: "text", required: true },
      { id: "city", label: "City", type: "select", required: true, options: CITIES },
      {
        id: "cityOther",
        label: "Please specify your city",
        type: "text",
        showIf: { field: "city", in: ["Other"] },
        required: true,
      },
      { id: "locality", label: "Locality / Area", type: "select", required: true, options: LOCALITIES },
      {
        id: "localityOther",
        label: "Please specify your locality",
        type: "text",
        showIf: { field: "locality", in: ["Other"] },
        required: true,
      },
      { id: "phone", label: "Contact phone number", type: "tel", required: true, placeholder: "10-digit mobile number" },
      { id: "email", label: "Contact email", type: "email" },
      { id: "website", label: "Website (if applicable)", type: "url", placeholder: "https://" },
      {
        id: "languages",
        label: "Languages spoken by staff",
        type: "checkbox",
        required: true,
        options: ["Hindi", "English", "Punjabi", "Other"],
      },
      {
        id: "operatingHours",
        label: "Operating hours",
        type: "radio",
        required: true,
        options: ["Open 24 hours", "Specific hours every day", "Hours vary by day"],
      },
      {
        id: "openingTime",
        label: "Opening time",
        type: "time",
        required: true,
        showIf: { field: "operatingHours", in: ["Specific hours every day"] },
      },
      {
        id: "closingTime",
        label: "Closing time",
        type: "time",
        required: true,
        showIf: { field: "operatingHours", in: ["Specific hours every day"] },
      },
      {
        id: "photoUrl",
        label: "Facility photo (paste a shareable link)",
        type: "url",
        required: true,
        placeholder: "https://",
      },
      { id: "description", label: "Facility description", type: "textarea" },
      {
        id: "hasAccessibility",
        label: "Does your facility have any wheelchair/mobility accessibility features?",
        type: "radio",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "accessibilityFeatures",
        label: "Which accessibility features does your facility have?",
        type: "checkbox",
        required: true,
        options: [
          "Wheelchair-accessible entrance",
          "Ramp access",
          "Ground-floor option available",
          "Elevator available",
        ],
        showIf: { field: "hasAccessibility", in: ["Yes"] },
      },
    ],
  },
  {
    id: "trust",
    title: "Trust & verification",
    description:
      "Verified Provider status is determined by Serve Saathi after review — it is not something you select yourself. Please provide accurate registration details below.",
    fields: [
      { id: "licenseNumber", label: "Business registration / license number", type: "text", required: true },
      { id: "ownerName", label: "Owner / authorized contact person name", type: "text", required: true },
      {
        id: "licenseDocUrl",
        label: "Registration or license document (paste a shareable link)",
        type: "url",
        required: true,
        placeholder: "https://",
      },
      { id: "yearsInOperation", label: "Years in operation", type: "text" },
    ],
  },
];
