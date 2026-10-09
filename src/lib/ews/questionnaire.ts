// Elder Well-being Score (EWS) questionnaire v1.0.0 — the config the spec
// (section L.2) says should drive the check-in: dimensions, items, options,
// points, key items and safety triggers. Ported from the working demo
// (servesaathi.com/demo.html: DIMS, COPY, ITEMS, SAFETY, HEADLINES) and
// checked against "Serve Saathi Elder Well-being Score (EWS) - MVP
// Specification" (01 Oct 2026). Where the two differ, the spec wins:
//   - Option labels use the spec's first-person self wording ("I need help
//     with some of these"); the demo's neutral wording is kept as
//     `proxyLabel` for family members answering about the elder.
//   - S1's buttons follow the spec matrix (Call 14416 · Call 112 · Call my
//     trusted contact · Continue later).
//
// All copy here is fixed, clinically-reviewed text (pending sign-off — every
// cut-off and safety line is provisional, spec [CV]). Never generate or
// rephrase it at runtime. Plain TS (no enums) so `node --test` can strip the
// types and run the scoring tests without a build step.

export const QUESTIONNAIRE_VERSION = "1.0.0";

export type DimId = "ADL" | "NUT" | "MED" | "HOM" | "SOC" | "COG" | "EMO" | "FIN";
export type Mode = "self" | "assisted" | "proxy";
export type DimBand = "going_well" | "closer_look" | "needs_attention" | "not_applicable" | "insufficient";
export type OverallBand = "going_well" | "mostly_one" | "some_support" | "several_support" | "insufficient";
export type SafetyId =
  | "S1"
  | "S2A"
  | "S2B"
  | "S3A"
  | "S3B"
  | "S4A"
  | "S4B"
  | "S5A"
  | "S5B"
  | "S6"
  | "S7"
  | "S7B"
  | "S8"
  | "GENTLE";

/** itemId → option code. "prefer" / "skip" are recorded but never scored. */
export type Answers = Record<string, string>;

export type Dimension = {
  id: DimId;
  /** Full name, as in the spec's section C and the Figma dashboard rows. */
  name: string;
  /** Short name for chips and tags (demo naming). */
  short: string;
  /** "A few short questions about …" on the area intro. */
  about: string;
  /** Emotional and Financial: the intro warns that some answers are private. */
  personal?: boolean;
};

// Spec order: lowest emotional load first.
export const DIMS: Dimension[] = [
  { id: "ADL", name: "Daily Living Activities", short: "Daily Living", about: "managing everyday tasks" },
  { id: "NUT", name: "Nutrition & Hydration", short: "Food & Water", about: "eating and drinking" },
  { id: "MED", name: "Medication Management", short: "Medicines", about: "taking medicines" },
  { id: "HOM", name: "Home Safety & Environment", short: "Home Safety", about: "falls and feeling safe at home" },
  { id: "SOC", name: "Social Engagement", short: "Social Life", about: "time with people" },
  { id: "COG", name: "Cognitive & Memory Health", short: "Memory", about: "memory and thinking" },
  { id: "EMO", name: "Emotional & Mental Wellbeing", short: "Feelings", about: "how you have been feeling", personal: true },
  { id: "FIN", name: "Financial & Legal Preparedness", short: "Money & Papers", about: "papers and money matters", personal: true },
];

export const dimById = (id: DimId): Dimension => DIMS.find((d) => d.id === id)!;

export type Option = {
  code: string;
  label: string;
  /** Wording for proxy mode when it differs from the self wording. */
  proxyLabel?: string;
  /** 0–3, or null for unscored options. */
  points: number | null;
  /** Key-item response: forces the dimension to Needs attention. */
  key?: boolean;
  trigger?: SafetyId;
};

export type Item = {
  id: string;
  dim: DimId;
  scored: boolean;
  /** Self wording. */
  text: string;
  /** Proxy wording; `{n}` is the elder's name. */
  proxyText?: string;
  options: Option[];
  /** Respondent restriction: only this mode sees the item (default: either). */
  who?: "self" | "proxy";
  /** Self mode, after the elder confirms they are alone (EMO4, HOM4). */
  privateOnly?: boolean;
  /** FIN3: the self version is private-only; proxy may still answer. */
  selfPrivate?: boolean;
  /** Answer is evaluated in memory for its trigger, then discarded. */
  restricted?: boolean;
  /** Answer goes to the separate restricted store (FIN3). */
  restrictedStore?: boolean;
  /** Show the "The next question is personal" notice first. */
  jit?: boolean;
  optional?: boolean;
  /** No "Prefer not to say" / "Not sure" extra (optional items get "Skip"). */
  noPrefer?: boolean;
  /** Conditional display rule (spec L.3 C-3…C-7). */
  show?: (a: Answers) => boolean;
};

const o = (code: string, label: string, points: number | null, extra: Partial<Option> = {}): Option => ({
  code,
  label,
  points,
  ...extra,
});

/** The common 3/2/1/0 four-option shape. Each entry: [code, self label, proxy label?]. */
const four = (...rows: [string, string, string?][]): Option[] =>
  rows.map(([code, label, proxyLabel], i) => o(code, label, 3 - i, proxyLabel ? { proxyLabel } : {}));

const emoTrigger = (a: Answers) => ["most", "almost"].includes(a.EMO1) || ["rarely", "notatall"].includes(a.EMO2);

export const ITEMS: Item[] = [
  // ── Daily Living ────────────────────────────────────────────────────────
  {
    id: "ADL1",
    dim: "ADL",
    scored: true,
    text: "How do you manage personal care – bathing, dressing, using the toilet?",
    proxyText: "How does {n} manage personal care – bathing, dressing, using the toilet?",
    options: four(
      ["easy", "On my own, easily"],
      ["diff", "On my own, with some difficulty"],
      ["some", "I need help with some of these", "Needs help with some of these"],
      ["most", "I need help with most or all", "Needs help with most or all"]
    ),
  },
  {
    id: "ADL2",
    dim: "ADL",
    scored: true,
    text: "How do you manage household tasks – cooking, cleaning, shopping, getting to places?",
    proxyText: "How does {n} manage household tasks – cooking, cleaning, shopping, getting to places?",
    options: four(
      ["easy", "On my own, easily"],
      ["diff", "On my own, with some difficulty"],
      ["some", "I need help with some of these", "Needs help with some of these"],
      ["most", "I need help with most or all", "Needs help with most or all"]
    ),
  },
  {
    id: "ADL3",
    dim: "ADL",
    scored: true,
    text: "Do you get the help you need with daily tasks?",
    proxyText: "Does {n} get the help they need with daily tasks?",
    options: [
      o("none", "I don’t need help", 3, { proxyLabel: "Doesn’t need help" }),
      o("yes", "Yes, I get enough help", 3, { proxyLabel: "Yes, gets enough help" }),
      o("sometimes", "Sometimes, not always", 1),
      o("no", "No, I often go without help I need", 0, { key: true, proxyLabel: "No, often goes without help needed" }),
    ],
  },

  // ── Food & Water ────────────────────────────────────────────────────────
  {
    id: "NUT1",
    dim: "NUT",
    scored: true,
    text: "Over the past month, how much have you been eating compared with usual?",
    proxyText: "Over the past month, how much has {n} been eating compared with usual?",
    options: [
      o("same", "About the same", 3),
      o("bit", "A bit less", 2),
      o("much", "Much less", 1),
      o("hardly", "Hardly eating", 0, { key: true }),
    ],
  },
  {
    id: "NUT2",
    dim: "NUT",
    scored: true,
    text: "In the past 3 months, have you lost weight without trying (clothes looser, or someone noticed)?",
    proxyText: "In the past 3 months, has {n} lost weight without trying?",
    options: [
      o("no", "No", 3),
      o("notsure", "Not sure", 2),
      o("little", "Yes, a little", 1),
      o("lot", "Yes, a lot", 0, { key: true }),
    ],
  },
  {
    id: "NUT3",
    dim: "NUT",
    scored: true,
    text: "Do you drink enough water and other fluids through the day?",
    proxyText: "Does {n} drink enough water and other fluids through the day?",
    options: four(
      ["yes", "Yes"],
      ["mostly", "Mostly"],
      ["forget", "I often forget or don’t feel thirsty", "Often forgets or doesn’t feel thirsty"],
      ["hardly", "Hardly at all"]
    ),
  },
  {
    id: "NUT4",
    dim: "NUT",
    scored: false,
    text: "In the past week, were there days when you did not have enough food or drinking water at home?",
    proxyText: "In the past week, were there days when {n} did not have enough food or drinking water at home?",
    options: [
      o("no", "No", null),
      o("once", "Once", null),
      o("several", "On several days", null, { trigger: "S5B" }),
      o("today", "Yes, today, and no one to help get it", null, { trigger: "S5A" }),
    ],
  },

  // ── Medicines ───────────────────────────────────────────────────────────
  {
    id: "MED0",
    dim: "MED",
    scored: false,
    text: "Do you take any medicines regularly?",
    proxyText: "Does {n} take any medicines regularly?",
    options: [o("yes", "Yes", null), o("no", "No", null)],
  },
  {
    id: "MED1",
    dim: "MED",
    scored: true,
    show: (a) => a.MED0 === "yes",
    text: "How often do you miss a dose or take a medicine at the wrong time?",
    proxyText: "How often does {n} miss a dose or take a medicine at the wrong time?",
    options: [
      o("rarely", "Rarely or never", 3),
      o("sometimes", "Sometimes", 2),
      o("often", "Often", 1),
      o("notsure", "I’m not sure", 1, { proxyLabel: "Not sure" }),
    ],
  },
  {
    id: "MED2",
    dim: "MED",
    scored: true,
    show: (a) => a.MED0 === "yes",
    text: "How confident are you that you take your medicines the way your doctor advised?",
    proxyText: "How confident are you that {n} takes medicines the way the doctor advised?",
    options: four(["very", "Very confident"], ["fairly", "Fairly confident"], ["notvery", "Not very confident"], ["notatall", "Not at all"]),
  },
  {
    id: "MED3",
    dim: "MED",
    scored: true,
    show: (a) => a.MED0 === "yes",
    text: "In the past month, have you run out of a medicine, skipped one because of cost, or had a side effect that worried you?",
    proxyText: "In the past month, has {n} run out of a medicine, skipped one because of cost, or had a worrying side effect?",
    options: [
      o("no", "No", 3),
      o("once", "Once", 2),
      o("more", "More than once", 1),
      o("now", "Yes, and it is happening now", 0, { key: true }),
    ],
  },
  {
    id: "MED4",
    dim: "MED",
    scored: false,
    show: (a) => a.MED0 === "yes" && (["sometimes", "often", "notsure"].includes(a.MED1) || a.MED3 === "now"),
    text: "Do you feel unwell right now after taking, missing or mixing up a medicine?",
    proxyText: "Does {n} feel unwell right now after taking, missing or mixing up a medicine?",
    options: [
      o("no", "No", null),
      o("little", "A little, not urgent", null, { trigger: "S4B" }),
      o("quite", "Yes, I feel quite unwell", null, { trigger: "S4A", proxyLabel: "Yes, quite unwell" }),
    ],
  },

  // ── Home Safety ─────────────────────────────────────────────────────────
  {
    id: "HOM1",
    dim: "HOM",
    scored: true,
    text: "In the past 6 months, have you fallen, or nearly fallen?",
    proxyText: "In the past 6 months, has {n} fallen, or nearly fallen?",
    options: [
      o("no", "No", 3),
      o("nearly", "Nearly fell, but didn’t", 2),
      o("once", "Fell once", 1),
      o("more", "Fell more than once", 0, { key: true }),
    ],
  },
  {
    id: "HOM1b",
    dim: "HOM",
    scored: false,
    show: (a) => ["once", "more"].includes(a.HOM1),
    text: "Are you hurt or in pain from a fall right now, or have you been unable to get up after a fall?",
    proxyText: "Is {n} hurt or in pain from a fall right now, or been unable to get up after a fall?",
    options: [
      o("no", "No", null),
      o("oknow", "I was hurt, but I’m OK now", null, { trigger: "S3B", proxyLabel: "Was hurt, but OK now" }),
      o("now", "Yes, hurt or in pain now / couldn’t get up", null, { trigger: "S3A" }),
    ],
  },
  {
    id: "HOM2",
    dim: "HOM",
    scored: true,
    text: "How safe does moving around your home feel – stairs, bathroom, lighting at night, slippery floors, loose wires?",
    proxyText: "How safe does moving around the home seem for {n} – stairs, bathroom, lighting, floors, wires?",
    options: four(
      ["very", "Very safe"],
      ["mostly", "Mostly safe"],
      ["some", "Some places feel unsafe"],
      ["often", "I often feel unsafe", "Often feels unsafe"]
    ),
  },
  {
    id: "HOM3",
    dim: "HOM",
    scored: true,
    text: "If you needed urgent help at home, could you reach someone quickly?",
    proxyText: "If {n} needed urgent help at home, could they reach someone quickly?",
    options: [
      o("always", "Yes, always (phone with me / someone at home)", 3),
      o("usually", "Usually", 2),
      o("notalways", "Not always", 1),
      o("no", "No", 0, { key: true }),
    ],
  },
  {
    id: "HOM4",
    dim: "HOM",
    scored: false,
    who: "self",
    privateOnly: true,
    restricted: true,
    jit: true,
    optional: true,
    noPrefer: true,
    text: "Do you feel safe with the people around you? Has anyone hurt you, threatened you, neglected your needs, or made you afraid?",
    options: [
      o("safe", "I feel safe; nothing like this", null),
      o("pns", "Prefer not to say", null, { trigger: "GENTLE" }),
      o("yes", "Yes, something like this has happened", null, { trigger: "S6" }),
    ],
  },
  {
    id: "HOM4P",
    dim: "HOM",
    scored: false,
    who: "proxy",
    restricted: true,
    jit: true,
    optional: true,
    noPrefer: true,
    text: "Are you worried that {n} is being hurt, neglected, threatened or taken advantage of by anyone?",
    options: [o("no", "No", null), o("pns", "Not sure", null, { trigger: "GENTLE" }), o("yes", "Yes", null, { trigger: "S6" })],
  },

  // ── Social Life ─────────────────────────────────────────────────────────
  {
    id: "SOC1",
    dim: "SOC",
    scored: true,
    text: "How often do you spend time with others or take part in things you enjoy – family, friends, prayer or community gatherings, groups, walks?",
    proxyText: "How often does {n} spend time with others or take part in things they enjoy?",
    options: four(["most", "Most days"], ["week", "About once a week"], ["few", "A few times a month"], ["rarely", "Rarely or never"]),
  },
  {
    id: "SOC2",
    dim: "SOC",
    scored: true,
    text: "How often do you feel lonely or left out?",
    proxyText: "Does {n} seem lonely or say they feel left out?",
    options: four(["rarely", "Rarely or never"], ["some", "Some of the time"], ["often", "Often"], ["always", "Almost always"]),
  },
  {
    id: "SOC3",
    dim: "SOC",
    scored: true,
    text: "Is there someone you can rely on to help in an emergency, day or night?",
    proxyText: "Is there someone {n} can rely on to help in an emergency, day or night?",
    options: [
      o("nearby", "Yes, nearby", 3),
      o("far", "Yes, but far away", 2),
      o("notsure", "Not sure", 1),
      o("no", "No", 0, { key: true }),
    ],
  },

  // ── Memory ──────────────────────────────────────────────────────────────
  {
    id: "COG1",
    dim: "COG",
    scored: true,
    text: "In the past month, how often has forgetfulness caused problems in daily life – missing appointments, repeating the same question, misplacing important things?",
    proxyText: "In the past month, how often has forgetfulness caused problems in {n}’s daily life?",
    options: four(["never", "Never"], ["occ", "Occasionally"], ["often", "Often"], ["most", "Most days"]),
  },
  {
    id: "COG2",
    dim: "COG",
    scored: true,
    text: "Compared with a year ago, is your memory or thinking…",
    proxyText: "Compared with a year ago, is {n}’s memory or thinking…",
    options: [
      o("same", "About the same or better", 3),
      o("little", "A little worse", 2),
      o("noticeably", "Noticeably worse", 1),
      o("much", "Much worse; it affects daily life", 0, { key: true }),
    ],
  },
  {
    id: "COG3",
    dim: "COG",
    scored: true,
    text: "In the past month, have you become confused about where you are in a familiar place, or about the day or time, in a way that worried you or others?",
    proxyText: "In the past month, has {n} become confused about where they are in a familiar place, or about the day or time?",
    options: four(["no", "No"], ["brief", "Once or twice, briefly"], ["several", "Several times"], ["often", "Often"]),
  },
  {
    id: "COG3b",
    dim: "COG",
    scored: false,
    noPrefer: true,
    show: (a) => ["several", "often"].includes(a.COG3),
    text: "Did this confusion start suddenly, within the last few days?",
    options: [
      o("gradual", "No, it has been gradual", null),
      o("notsure", "Not sure", null, { trigger: "S2B" }),
      o("sudden", "Yes, it started suddenly", null, { trigger: "S2A" }),
    ],
  },

  // ── Feelings ────────────────────────────────────────────────────────────
  {
    id: "EMO1",
    dim: "EMO",
    scored: true,
    text: "Over the past 2 weeks, how often have you felt low, sad, or without hope?",
    proxyText: "Over the past 2 weeks, how often has {n} seemed low, sad or without hope?",
    options: [
      o("rarely", "Rarely or never", 3),
      o("some", "Some days", 2),
      o("most", "Most days", 1),
      o("almost", "Almost every day", 0, { key: true }),
    ],
  },
  {
    id: "EMO2",
    dim: "EMO",
    scored: true,
    text: "Over the past 2 weeks, how often have you enjoyed the things you usually like doing?",
    proxyText: "Over the past 2 weeks, how often has {n} enjoyed the things they usually like doing?",
    options: [
      o("most", "Most days", 3),
      o("some", "Some days", 2),
      o("rarely", "Rarely", 1),
      o("notatall", "Not at all", 0, { key: true }),
    ],
  },
  {
    id: "EMO3",
    dim: "EMO",
    scored: true,
    text: "Over the past 2 weeks, how often have you felt worried, tense, or unable to stop worrying?",
    proxyText: "Over the past 2 weeks, how often has {n} seemed worried or tense?",
    options: four(["rarely", "Rarely or never"], ["some", "Some days"], ["most", "Most days"], ["almost", "Almost every day"]),
  },
  {
    id: "EMO4",
    dim: "EMO",
    scored: false,
    who: "self",
    privateOnly: true,
    restricted: true,
    jit: true,
    optional: true,
    noPrefer: true,
    show: emoTrigger,
    text: "Sometimes when people feel very low, they think that life isn’t worth living, or about harming themselves. In the past 2 weeks, have you had thoughts like this?",
    options: [
      o("no", "No", null),
      o("pns", "Prefer not to say", null, { trigger: "GENTLE" }),
      o("sometimes", "Sometimes", null, { trigger: "S1" }),
      o("often", "Often", null, { trigger: "S1" }),
    ],
  },
  {
    id: "EMO4P",
    dim: "EMO",
    scored: false,
    who: "proxy",
    restricted: true,
    jit: true,
    optional: true,
    noPrefer: true,
    show: emoTrigger,
    text: "Has {n} said or done anything recently that makes you worried they might harm themselves or don’t want to live?",
    options: [o("no", "No", null), o("pns", "Not sure", null, { trigger: "GENTLE" }), o("yes", "Yes", null, { trigger: "S1" })],
  },

  // ── Money & Papers ──────────────────────────────────────────────────────
  {
    id: "FIN1",
    dim: "FIN",
    scored: true,
    text: "Are your important papers (ID, bank, pension, property, insurance, medical records) organised, and does someone you trust know where they are?",
    proxyText: "Are {n}’s important papers organised, and does someone they trust know where they are?",
    options: four(["yes", "Yes"], ["partly", "Partly"], ["notreally", "Not really"], ["no", "No"]),
  },
  {
    id: "FIN2",
    dim: "FIN",
    scored: true,
    optional: true,
    text: "Have you made arrangements for who would handle your money or decisions if you couldn’t – such as nominees on accounts, a will, or a power of attorney?",
    proxyText: "Has {n} made arrangements for who would handle money or decisions if they couldn’t – nominees, a will, or power of attorney?",
    options: four(
      ["most", "Yes, most of these"],
      ["some", "Some of these"],
      ["thinking", "I’m thinking about it", "Thinking about it"],
      ["none", "None / not sure what these are"]
    ),
  },
  {
    id: "FIN3",
    dim: "FIN",
    scored: true,
    selfPrivate: true,
    restrictedStore: true,
    jit: true,
    optional: true,
    text: "In the past 6 months, has anyone pressured you about money or property, asked for your OTP or bank details, or have you lost money to a scam or someone you trusted?",
    proxyText: "Are you worried someone is pressuring {n} about money or property, asking for OTP or bank details, or that they lost money to a scam?",
    options: [
      o("no", "No", 3),
      o("notsure", "Not sure", 1),
      o("past", "Yes, in the past", 0, { key: true, trigger: "S7B" }),
      o("now", "Yes, it is happening now", 0, { key: true, trigger: "S7" }),
    ],
  },
];

export const itemById = (id: string): Item | undefined => ITEMS.find((i) => i.id === id);

/** Codes for the non-option answers every required item offers. */
export const PREFER = "prefer";
export const SKIP = "skip";

// ── Bands ─────────────────────────────────────────────────────────────────
// Always pair colour with a word and a symbol shape (spec F, colour-blind and
// low-vision safe). Never "risk", "poor", "critical" (spec F copy rules).
export const BANDS: Record<DimBand, { label: string; mark: string }> = {
  going_well: { label: "Going well", mark: "✔" },
  closer_look: { label: "Worth a closer look", mark: "▲" },
  needs_attention: { label: "Needs attention", mark: "◆" },
  not_applicable: { label: "Not applicable", mark: "○" },
  insufficient: { label: "Not enough info", mark: "○" },
};

export const HEADLINES: Record<OverallBand, string> = {
  going_well: "Overall, things are going well.",
  mostly_one: "Mostly going well, with one area that needs attention",
  some_support: "Many things are going well, and some areas could use support.",
  several_support: "Several areas could use support. Let’s take them one step at a time.",
  insufficient: "We need a few more answers to show an overall picture.",
};

/** Short overall label (demo `short()`), used on cards and chips. */
export const OVERALL_SHORT: Record<OverallBand, string> = {
  going_well: "Overall going well",
  mostly_one: "Mostly going well",
  some_support: "Some areas to support",
  several_support: "Several areas to support",
  insufficient: "Not enough answers yet",
};

// ── Plain-language copy per dimension (spec C) ────────────────────────────
export type DimCopy = {
  going_well: string;
  closer_look: string;
  needs_attention: string;
  /** Primary action button label on a focus card. */
  action: string;
  /** "Your next steps" checklist entries. */
  steps: string[];
  /** "Things that can help" — information, connection or coordination only. */
  resources: string[];
  /** Family "Ways you can help". */
  help: string[];
};

export const COPY: Record<DimId, DimCopy> = {
  ADL: {
    going_well: "You’re managing daily tasks well.",
    closer_look: "Some daily tasks are getting harder. Small changes or a little help can make a big difference.",
    needs_attention: "You may not be getting all the help you need with daily tasks. Let’s look at support options together.",
    action: "See support options",
    steps: ["Ask our helpline about help at home", "Share a task list with family"],
    resources: ["Helpline callback", "Family shared task list", "Directory: home-care, attendants (listing only)"],
    help: ["Agree who helps with which daily task", "Check in on shopping and cooking"],
  },
  NUT: {
    going_well: "You’re eating and drinking as usual.",
    closer_look: "Eating or drinking has dropped a little. Keep an eye on it, especially in hot weather.",
    needs_attention: "You’re eating much less or have lost weight without trying. It’s worth mentioning to a doctor.",
    action: "See meal & water tips",
    steps: ["Mention eating changes to your doctor", "Read: simple meals and staying hydrated"],
    resources: ["Hydration guide", "Simple meals guide", "Family meal checks", "Directory: dieticians, tiffin services (listing only)"],
    help: ["Share a meal together a few times a week", "Keep water within easy reach"],
  },
  MED: {
    going_well: "You’re keeping on top of your medicines.",
    closer_look: "Medicines are sometimes missed or confusing. Simple tools like a pill box or reminders can help.",
    needs_attention: "Medicines seem hard to manage right now. Please ask your doctor or pharmacist to review all your medicines with you.",
    action: "See medicine tips",
    steps: ["Ask your doctor to review your medicines", "Try a weekly pill box"],
    resources: ["Medicine-routine guide", "Bring all your medicines to your next doctor visit", "Directory: pharmacies (listing only)"],
    help: ["Help set up a weekly pill box", "Go along to the next medicine review"],
  },
  HOM: {
    going_well: "Your home feels safe and you can reach help.",
    closer_look: "A few things at home may make falls more likely. Simple fixes can help.",
    needs_attention: "Falls or difficulty reaching help put you at risk. Let’s make a plan.",
    action: "See home-safety tips",
    steps: ["Talk to your doctor about falls", "Add an emergency contact", "Read: making your bathroom safer"],
    resources: ["Home-safety checklist", "Emergency-contact setup", "Talk to your doctor about falls", "Directory: physiotherapy, home modification (listing only)"],
    help: ["Check bathroom and stair lighting together", "Be her emergency contact"],
  },
  SOC: {
    going_well: "You’re staying connected with people and activities.",
    closer_look: "You’d like a bit more connection. Small regular contact helps.",
    needs_attention: "You may be feeling quite alone, or not have someone to call in an emergency. Let’s set that up.",
    action: "Set up a trusted contact",
    steps: ["Set up a trusted contact", "Try a weekly tele-check-in"],
    resources: ["Tele-check-ins", "Set trusted contact", "Community / activity listings"],
    help: ["Set a regular weekly call", "Join her for a community activity"],
  },
  COG: {
    going_well: "You haven’t noticed memory changes getting in the way of daily life.",
    closer_look: "Some forgetfulness is affecting daily life. Many things can affect memory, and some are easy to address.",
    needs_attention:
      "Memory or thinking changes seem to be affecting daily life. It’s worth talking to a doctor – a check-up is the only way to understand what’s going on.",
    action: "See memory-friendly tips",
    steps: ["Use the “what to tell your doctor” checklist", "Read: memory-friendly routines"],
    resources: ["Memory-friendly routines", "Reminder setup", "“What to tell your doctor” checklist", "Directory: geriatricians, memory clinics (listing only)"],
    help: ["Help keep a simple daily routine", "Go along to a doctor check-up"],
  },
  EMO: {
    going_well: "You’ve mostly been feeling OK and enjoying things.",
    closer_look: "You’ve had some low or worried days. Talking to someone you trust can help.",
    needs_attention:
      "You’ve been feeling low or worried a lot recently. You don’t have to manage this alone – talking to a doctor or counsellor can help.",
    action: "See ways to get support",
    steps: ["Talk to someone you trust, or call Tele-MANAS 14416", "Try a weekly tele-check-in"],
    resources: ["Tele-check-in", "Tele-MANAS 14416 (free, any time)", "Family conversation guide", "Directory: counsellors (listing only)"],
    help: ["Make time to talk, without judging", "Read the family conversation guide"],
  },
  FIN: {
    going_well: "Your papers and arrangements are in good order.",
    closer_look: "Some papers or arrangements could be put in order.",
    needs_attention: "Your money or property may be at risk, or important arrangements are missing. Help is available.",
    action: "See document checklist",
    steps: ["Go through the document checklist", "Read: staying safe from scams"],
    resources: ["Document checklist", "Scam-awareness guide", "Directory: lawyers, CAs, legal aid (information only, not legal advice)"],
    help: ["Help organise important papers", "Talk about OTP and scam safety"],
  },
};

// ── Safety & escalation matrix (spec E) ───────────────────────────────────
// Copy is fixed — never generated or altered at runtime.
export type SafetyAction = "call" | "notify" | "callback" | "continue_later";
export type SafetyButton = { kind: SafetyAction; number?: string; label: string; private?: boolean };

export type SafetyCard = {
  tier: 1 | 2 | 3;
  /** One-line label for the results-screen "support information shown" list. */
  short: string;
  msg: string;
  buttons?: SafetyButton[];
  /** Never shown to family, never shareable (S1, S6). */
  hideFamily?: boolean;
  /** S6: offers a "Quick exit" and never notifies anyone. */
  quickExit?: boolean;
  noNotify?: boolean;
};

const call = (number: string, label: string): SafetyButton => ({ kind: "call", number, label });

export const SAFETY: Record<SafetyId, SafetyCard> = {
  S1: {
    tier: 1,
    short: "Support for difficult feelings · Tele-MANAS 14416",
    msg: "Thank you for telling us. You don’t have to go through this alone. Please talk to someone now. Tele-MANAS (14416) is free, any time of day or night, in your language. If you feel you may act on these thoughts, call 112 now.",
    buttons: [
      call("14416", "Call 14416 (Tele-MANAS)"),
      call("112", "Call 112 (Emergency)"),
      { kind: "notify", label: "Call my trusted contact" },
      { kind: "continue_later", label: "Continue later" },
    ],
    hideFamily: true,
  },
  S2A: {
    tier: 1,
    short: "Sudden confusion · doctor today, 108/112 if very unwell",
    msg: "Confusion that starts suddenly can be a sign of a medical problem that needs a doctor quickly. Please contact a doctor today, or call 108/112 if the person is very unwell, drowsy, has a fever, or has trouble speaking or moving.",
    buttons: [call("108", "Call 108 (Ambulance)"), call("112", "Call 112 (Emergency)"), { kind: "notify", label: "Alert my trusted contact" }],
  },
  S2B: {
    tier: 2,
    short: "New confusion · tell a doctor soon",
    msg: "If this confusion is new or getting worse, please let a doctor know soon.",
  },
  S3A: {
    tier: 1,
    short: "Hurt after a fall · 108 / 112",
    msg: "If you are hurt or in pain right now, please get help now. Call 108 or 112, or call someone nearby.",
    buttons: [call("108", "Call 108 (Ambulance)"), call("112", "Call 112 (Emergency)"), { kind: "notify", label: "Call my trusted contact" }],
  },
  S3B: {
    tier: 2,
    short: "Injury from a fall · tell a doctor",
    msg: "A fall that caused injury is worth telling a doctor about, even if you feel fine now.",
  },
  S4A: {
    tier: 1,
    short: "Unwell after medicine · doctor/pharmacist now",
    msg: "If you feel unwell after taking, missing or mixing up a medicine, please contact your doctor or a pharmacist now. If you have trouble breathing, chest pain, severe drowsiness or confusion, call 108 or 112.",
    buttons: [call("108", "Call 108 (Ambulance)"), call("112", "Call 112 (Emergency)"), { kind: "notify", label: "Let my trusted contact know" }],
  },
  S4B: {
    tier: 2,
    short: "Medicine concern · mention to doctor",
    msg: "Please mention this to your doctor or pharmacist soon.",
  },
  S5A: {
    tier: 1,
    short: "No food or water today · Elderline 14567",
    msg: "Everyone needs food and water every day. Please call someone who can help today. Elderline 14567 can also help connect you to local support (8 am–8 pm).",
    buttons: [{ kind: "notify", label: "Call my trusted contact" }, call("14567", "Call 14567 (Elderline)"), { kind: "callback", label: "Request a callback" }],
  },
  S5B: {
    tier: 2,
    short: "Food/water hard to get some days",
    msg: "It sounds like getting food or water has been hard some days. Let’s find a way to make it reliable.",
  },
  S6: {
    tier: 1,
    short: "Feeling unsafe · 112, Elderline 14567",
    msg: "Thank you for trusting us with this. No one should be hurt, threatened or neglected. If you are in danger now, call 112. Elderline 14567 can listen and guide you on support and your rights.",
    buttons: [
      call("112", "Call 112 (Emergency)"),
      call("14567", "Call 14567 (Elderline)"),
      { kind: "callback", label: "Request a private callback", private: true },
    ],
    quickExit: true,
    hideFamily: true,
    noNotify: true,
  },
  S7: {
    tier: 1,
    short: "Money being taken now · bank + 1930",
    msg: "If someone is asking for your OTP, PIN or bank details, or money is being taken now, do not share anything. Call your bank and the cyber fraud helpline 1930 right away.",
    buttons: [call("1930", "Call 1930 (Cyber fraud)"), { kind: "notify", label: "Let my trusted contact know" }],
  },
  S7B: {
    tier: 2,
    short: "Past money loss · protection tips",
    msg: "We’re sorry this happened. Help is available to protect your money and property in future.",
  },
  S8: {
    tier: 2,
    short: "Not enough help nearby · support plan",
    msg: "It sounds like you may not have enough help nearby. Let’s work on a support plan together.",
  },
  GENTLE: {
    tier: 3,
    short: "Support numbers",
    msg: "That’s completely fine. If you ever want to talk to someone, these numbers are free: Tele-MANAS 14416, Elderline 14567.",
  },
};

// ── Fixed results-screen copy (spec F) ────────────────────────────────────
export const DISCLAIMER =
  "The Elder Well-being Score is a simple check-in to help you and your family notice how things are going and find useful support. It is not a medical test or diagnosis and does not replace advice from a doctor or other professional.";
export const WHEN_PROFESSIONAL =
  "Talk to a doctor if you notice: memory changes that affect daily life, eating much less or losing weight without trying, a fall, feeling low most days for 2 weeks or more, or trouble managing medicines.";
export const WHEN_URGENT =
  "Call 112 or 108 if someone is badly hurt after a fall, suddenly confused, has chest pain or trouble breathing, or is in danger. For emotional distress, Tele-MANAS 14416 is free, any time.";
export const CALLBACK_HOURS = "Our team calls back on working days, 9 am–6 pm.";
export const NOT_EMERGENCY = "Serve Saathi is not an emergency service.";
export const TREND_GUARDRAIL =
  "Changes in your check-in reflect your answers, not a medical measurement. Only a professional can tell what a change means.";
export const FIRST_CHECK_IN = "This is your starting point. Next time, you’ll be able to see what has changed.";
