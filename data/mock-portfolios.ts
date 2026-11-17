/**
 * Eight made-up clients with full portfolios. No real people.
 * Every `sourceQuote` is copied word for word from the client's form in /public/mock-forms
 * (checked by `npm run check:data`).
 */
import type { CategoryKey } from "@/lib/categories";
import type { MatchmakerId } from "@/lib/matchmakers";
import { matchmakerName } from "@/lib/matchmakers";
import type {
  FollowUp,
  LogEntry,
  LogKind,
  Portfolio,
  Preference,
  PreferenceStatus,
  PreferenceType,
} from "@/lib/types";

// ---------- small helpers to keep the data readable ----------

const DB: PreferenceType = "deal_breaker";
const SOFT: PreferenceType = "soft_rule";

function pref(
  id: string,
  category: CategoryKey,
  label: string,
  type: PreferenceType,
  sourceQuote: string,
  status: PreferenceStatus = "ai_suggested",
  detail?: string,
): Preference {
  return { id, category, label, type, sourceQuote, status, ...(detail ? { detail } : {}) };
}

type ExtraLog = { at: string; kind: LogKind; summary: string; before?: string; after?: string };

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function build(input: {
  id: string;
  clientName: string;
  age: number;
  city: string;
  profession: string;
  matchmakerId: MatchmakerId;
  createdAt: string;
  summary: string;
  preferences: Preference[];
  followUps: FollowUp[];
  /** How many follow-ups the AI raised at the start (resolved ones count too). */
  aiFollowUps?: number;
  extraLog?: ExtraLog[];
}): Portfolio {
  const mm = matchmakerName(input.matchmakerId);
  const fileName = `${input.id}-intake-form.txt`;
  const uploadedAt = addMinutes(input.createdAt, 1);
  const aiFollowUps = input.aiFollowUps ?? input.followUps.length;

  const log: LogEntry[] = [
    { id: `${input.id}-l1`, at: input.createdAt, actor: mm, kind: "created", summary: "Portfolio created" },
    { id: `${input.id}-l2`, at: uploadedAt, actor: mm, kind: "form_uploaded", summary: `Intake form uploaded: ${fileName}` },
    {
      id: `${input.id}-l3`,
      at: addMinutes(input.createdAt, 2),
      actor: "AI",
      kind: "ai_sorted",
      summary: `AI sorted the form: ${input.preferences.length} preferences, ${aiFollowUps} follow-up question${aiFollowUps === 1 ? "" : "s"}`,
    },
    ...(input.extraLog ?? []).map((e, i) => ({ id: `${input.id}-l${i + 4}`, actor: mm, ...e })),
  ];

  const updatedAt = log.reduce((latest, e) => (e.at > latest ? e.at : latest), input.createdAt);

  return {
    id: input.id,
    clientName: input.clientName,
    age: input.age,
    city: input.city,
    profession: input.profession,
    matchmakerId: input.matchmakerId,
    summary: input.summary,
    preferences: input.preferences,
    followUps: input.followUps,
    log,
    form: { fileName, uploadedAt, mimeType: "text/plain", url: `/mock-forms/${input.id}.txt` },
    createdAt: input.createdAt,
    updatedAt,
  };
}

// ---------- Matchmaker A ----------

/** READY: everything reviewed, one follow-up resolved. */
const ananya = build({
  id: "ananya-iyer",
  clientName: "Ananya Iyer",
  age: 29,
  city: "Bangalore",
  profession: "Product designer at a fintech startup",
  matchmakerId: "A",
  createdAt: "2026-10-21T10:15:00.000Z",
  summary:
    "Ananya wants a kind, curious, slightly nerdy partner in Bangalore who backs her career. Vegetarian and non-smoking are firm, and she'd rather not live with in-laws. Warm, active and funny will win her over.",
  preferences: [
    pref("ananya-p1", "age_height", "Age 29 to 35", DB, "Age range: 29 to 35", "edited"),
    pref("ananya-p2", "age_height", "5'8\" or taller would be nice", SOFT, "5'8\" or taller would be nice", "confirmed"),
    pref("ananya-p3", "marital_status", "Never married only", DB, "Never married only", "confirmed"),
    pref("ananya-p4", "location", "Based in Bangalore, or willing to move there", DB, "Must be based in Bangalore, or willing to move here. I'm not relocating.", "confirmed"),
    pref("ananya-p5", "religion_community", "Hindu preferred, any community", SOFT, "Hindu preferred, community doesn't matter to me", "confirmed"),
    pref("ananya-p6", "language", "Comfortable in English, Tamil a bonus", SOFT, "Should speak English comfortably. Tamil is a bonus.", "confirmed"),
    pref("ananya-p7", "education", "Postgraduate, ideally creative or tech", SOFT, "Postgraduate degree, ideally in a creative or tech field", "confirmed"),
    pref("ananya-p8", "profession_income", "Must support her career", DB, "anyone who expects me to quit my job", "confirmed", "She will not give up work after marriage."),
    pref("ananya-p9", "lifestyle", "Vegetarian partner only", DB, "my partner must be vegetarian too", "confirmed"),
    pref("ananya-p10", "lifestyle", "No smoking", DB, "Strictly no smoking.", "confirmed"),
    pref("ananya-p11", "lifestyle", "Social drinking is fine", SOFT, "Social drinking is fine.", "confirmed"),
    pref("ananya-p12", "lifestyle", "Someone active, she treks most weekends", SOFT, "Ideally someone active. I trek most weekends.", "confirmed"),
    pref("ananya-p13", "family", "Won't live with in-laws after marriage", DB, "I don't want to live with in-laws after marriage.", "edited", "Happy to live close by."),
    pref("ananya-p14", "children", "Wants children in 3 to 4 years", SOFT, "Yes, I want children, maybe in 3-4 years.", "confirmed"),
    pref("ananya-p15", "values_personality", "Kind, curious, a little nerdy, with a sense of humour", SOFT, "Someone kind, curious and a little nerdy, who reads, travels and treats people well. Humour is very important to me.", "confirmed"),
  ],
  followUps: [
    {
      id: "ananya-f1",
      question: "Is living separately from in-laws a must for you, or a strong preference?",
      reason: "\"I don't want to live with in-laws\" sounds firm but isn't in her definite-no list, so it's unclear whether to rule out joint families.",
      relatedPreferenceIds: ["ananya-p13"],
      status: "resolved",
      resolutionNote: "Confirmed on call: it's a must. She's happy to live close to his parents.",
    },
  ],
  extraLog: [
    { at: "2026-10-22T05:30:00.000Z", kind: "moved", summary: "Moved \"Age 29 to 35\" to deal-breakers", before: "Soft rule", after: "Deal-breaker" },
    { at: "2026-10-22T05:32:00.000Z", kind: "confirmed_all", summary: "Confirmed all deal-breakers (6)" },
    { at: "2026-10-23T09:10:00.000Z", kind: "followup_resolved", summary: "Resolved: \"Is living separately from in-laws a must…\"", after: "Confirmed on call: it's a must. She's happy to live close to his parents." },
    { at: "2026-10-23T09:12:00.000Z", kind: "moved", summary: "Moved \"Won't live with in-laws after marriage\" to deal-breakers", before: "Soft rule", after: "Deal-breaker" },
    { at: "2026-10-23T09:13:00.000Z", kind: "edited", summary: "Added detail to \"Won't live with in-laws after marriage\"", before: "(no detail)", after: "Happy to live close by." },
    { at: "2026-10-24T06:00:00.000Z", kind: "confirmed_all", summary: "Confirmed all soft rules (8)" },
  ],
});

/** NEEDS FOLLOW-UP: community contradiction and a vague "good family". */
const rohan = build({
  id: "rohan-mehta",
  clientName: "Rohan Mehta",
  age: 33,
  city: "Mumbai",
  profession: "Vice President, investment banking",
  matchmakerId: "A",
  createdAt: "2026-11-10T07:40:00.000Z",
  summary:
    "Rohan wants a warm, grounded partner in Mumbai who is happy in a joint family with his parents and grandmother. He says she must be Gujarati, but also that values matter more than community, so that needs clearing up.",
  preferences: [
    pref("rohan-p1", "age_height", "Age 26 to 31", SOFT, "Age range: 26 to 31", "confirmed"),
    pref("rohan-p2", "age_height", "Height 5'3\" to 5'8\"", SOFT, "Height: 5'3\" to 5'8\""),
    pref("rohan-p3", "marital_status", "Never married", SOFT, "Marital status: Never married"),
    pref("rohan-p4", "location", "Mumbai only", DB, "Mumbai only. My work and family are here.", "confirmed"),
    pref("rohan-p5", "religion_community", "Gujarati family", DB, "Must be from a Gujarati family."),
    pref("rohan-p6", "language", "Gujarati or Hindi, plus fluent English", SOFT, "Gujarati or Hindi, and fluent English"),
    pref("rohan-p7", "education", "Graduate at least, MBA or CA a plus", SOFT, "Graduate at least. MBA or CA would be great."),
    pref("rohan-p8", "profession_income", "Working or not, her choice", SOFT, "Working or not working, both are fine. Her choice."),
    pref("rohan-p9", "lifestyle", "Vegetarian preferred, eggs okay", SOFT, "Vegetarian preferred, eggs are okay."),
    pref("rohan-p10", "lifestyle", "Non-smoker", DB, "Smoking: No.", "confirmed"),
    pref("rohan-p11", "lifestyle", "Occasional drinking is fine", SOFT, "Occasional is fine."),
    pref("rohan-p12", "family", "Comfortable living in a joint family", DB, "We live with my parents and grandmother, and I'd like my wife to be comfortable with that."),
    pref("rohan-p13", "family", "Good family background", SOFT, "I want someone from a good family background who is warm with my parents."),
    pref("rohan-p14", "children", "Wants two children eventually", SOFT, "Want two kids eventually."),
    pref("rohan-p15", "values_personality", "Values matter more than community", SOFT, "community is not that important to me, values matter more"),
    pref("rohan-p16", "values_personality", "Respects elders", DB, "Someone who doesn't respect elders.", "confirmed"),
  ],
  followUps: [
    {
      id: "rohan-f1",
      question: "Is a Gujarati family a must, or would you meet someone from another community with similar values?",
      reason: "\"Must be from a Gujarati family\" clashes with \"community is not that important to me, values matter more\".",
      relatedPreferenceIds: ["rohan-p5", "rohan-p15"],
      status: "open",
    },
    {
      id: "rohan-f2",
      question: "When you say \"good family background\", what matters most to you: education, values, financial standing, or something else?",
      reason: "\"Good family background\" is too vague to use when picking profiles.",
      relatedPreferenceIds: ["rohan-p13"],
      status: "open",
    },
  ],
  extraLog: [
    { at: "2026-11-12T11:05:00.000Z", kind: "confirmed", summary: "Confirmed \"Mumbai only\"" },
    { at: "2026-11-12T11:06:00.000Z", kind: "confirmed", summary: "Confirmed \"Non-smoker\"" },
    { at: "2026-11-12T11:06:30.000Z", kind: "confirmed", summary: "Confirmed \"Respects elders\"" },
    { at: "2026-11-12T11:08:00.000Z", kind: "moved", summary: "Moved \"Age 26 to 31\" to soft rules", before: "Deal-breaker", after: "Soft rule" },
  ],
});

/** NEW: just sorted, nothing reviewed yet, AI found nothing to follow up. */
const kavya = build({
  id: "kavya-reddy",
  clientName: "Kavya Reddy",
  age: 27,
  city: "Hyderabad",
  profession: "Paediatrics resident doctor",
  matchmakerId: "A",
  createdAt: "2026-11-17T12:20:00.000Z",
  summary:
    "Kavya is a resident doctor looking for a patient, emotionally mature partner who is proud of her career and shares the load at home. He must be a doctor or postgraduate and a non-smoker. Children only after 2028.",
  preferences: [
    pref("kavya-p1", "age_height", "Age 28 to 33", SOFT, "Age range: 28 to 33"),
    pref("kavya-p2", "age_height", "Taller than her (she's 5'5\")", SOFT, "Taller than me (I'm 5'5\")"),
    pref("kavya-p3", "marital_status", "Never married", SOFT, "Marital status: Never married"),
    pref("kavya-p4", "location", "Hyderabad or Bangalore, open to moving within India", SOFT, "Hyderabad or Bangalore. Open to moving for the right person within India."),
    pref("kavya-p5", "religion_community", "Hindu, any community", SOFT, "Hindu, any community"),
    pref("kavya-p6", "language", "Telugu speaking preferred", SOFT, "Telugu speaking preferred"),
    pref("kavya-p7", "education", "Doctor or postgraduate", DB, "Must be a doctor or have a postgraduate degree"),
    pref("kavya-p8", "profession_income", "Understands long hours and night shifts", SOFT, "Should understand long working hours, I have night shifts."),
    pref("kavya-p9", "lifestyle", "No smoking", DB, "Absolutely no smoking."),
    pref("kavya-p10", "lifestyle", "Occasional drinking is okay", SOFT, "Occasional drinking is okay."),
    pref("kavya-p11", "family", "Open to living with in-laws for a few years", SOFT, "Open to living with in-laws for the first few years."),
    pref("kavya-p12", "children", "Children only after residency (2028)", DB, "Want children, but only after I finish my residency in 2028."),
    pref("kavya-p13", "values_personality", "Patient, emotionally mature, proud of her career", SOFT, "Someone patient and emotionally mature, who is proud of my career and shares the load at home."),
    pref("kavya-p14", "values_personality", "Shares housework, no traditional cooking expectations", DB, "Anyone who thinks a wife should cook every day."),
  ],
  followUps: [],
});

/** NEEDS FOLLOW-UP: NRI in London, children answer too vague. */
const arjun = build({
  id: "arjun-malhotra",
  clientName: "Arjun Malhotra",
  age: 36,
  city: "London (NRI)",
  profession: "Management consultant, Associate Partner",
  matchmakerId: "A",
  createdAt: "2026-11-05T15:00:00.000Z",
  summary:
    "Arjun has lived in London since 2015 and wants an independent, well-travelled partner who will move there and keep working. She must speak Hindi or Punjabi for his parents. He hasn't decided about children yet.",
  preferences: [
    pref("arjun-p1", "age_height", "Age 29 to 35", SOFT, "Age range: 29 to 35", "confirmed"),
    pref("arjun-p2", "age_height", "5'4\" and above", SOFT, "5'4\" and above", "confirmed"),
    pref("arjun-p3", "marital_status", "Open to divorced, ideally without children", SOFT, "Open to divorced, no kids preferred", "confirmed"),
    pref("arjun-p4", "location", "Willing to move to London", DB, "Must be willing to move to London. I'm settled here and won't move back.", "confirmed"),
    pref("arjun-p5", "religion_community", "Hindu or Sikh, Punjabi preferred", SOFT, "Hindu or Sikh, Punjabi preferred", "confirmed"),
    pref("arjun-p6", "language", "Speaks Hindi or Punjabi", DB, "Must speak Hindi or Punjabi, my parents don't speak much English", "confirmed"),
    pref("arjun-p7", "education", "Good university, any field", SOFT, "Good university, field doesn't matter", "confirmed"),
    pref("arjun-p8", "profession_income", "Wants to keep working in the UK", SOFT, "Should want to keep working. She would need a UK work visa.", "edited", "No visa needed upfront: Arjun will sponsor a spouse visa."),
    pref("arjun-p9", "lifestyle", "Non-smoker", DB, "Smoking: Non-smoker.", "confirmed"),
    pref("arjun-p10", "lifestyle", "Comfortable with social drinking", SOFT, "I drink socially, so would prefer someone who's okay with that."),
    pref("arjun-p11", "lifestyle", "Into fitness would be nice", SOFT, "Would be nice if she's into fitness."),
    pref("arjun-p12", "family", "Comfortable with his parents visiting 3 months a year", SOFT, "My parents live in Delhi and visit for 3 months every year."),
    pref("arjun-p13", "children", "Undecided about children", SOFT, "Haven't really thought about it. Maybe."),
    pref("arjun-p14", "values_personality", "Independent, well-travelled, confident", SOFT, "Independent, well-travelled, confident."),
  ],
  followUps: [
    {
      id: "arjun-f1",
      question: "Would you like children, and if so, roughly when? It's one of the first things matches will ask.",
      reason: "The children answer (\"Haven't really thought about it. Maybe.\") is too vague to filter profiles on.",
      relatedPreferenceIds: ["arjun-p13"],
      status: "open",
    },
    {
      id: "arjun-f2",
      question: "Does she need to already have a UK work visa, or would you sponsor one?",
      reason: "\"She would need a UK work visa\" could rule out most India-based profiles if read as a requirement.",
      relatedPreferenceIds: ["arjun-p8"],
      status: "resolved",
      resolutionNote: "No visa needed upfront. Arjun will sponsor a spouse visa.",
    },
  ],
  extraLog: [
    { at: "2026-11-06T10:00:00.000Z", kind: "confirmed_all", summary: "Confirmed all deal-breakers (3)" },
    { at: "2026-11-13T17:20:00.000Z", kind: "followup_resolved", summary: "Resolved: \"Does she need to already have a UK work visa…\"", after: "No visa needed upfront. Arjun will sponsor a spouse visa." },
    { at: "2026-11-13T17:22:00.000Z", kind: "edited", summary: "Edited \"Wants to keep working in the UK\"", before: "Needs a UK work visa", after: "Wants to keep working in the UK" },
    { at: "2026-11-14T08:45:00.000Z", kind: "confirmed", summary: "Confirmed 5 soft rules" },
  ],
});

// ---------- Matchmaker B ----------

/** NEW: fresh, nothing reviewed. */
const ishaan = build({
  id: "ishaan-kapoor",
  clientName: "Ishaan Kapoor",
  age: 31,
  city: "Gurgaon",
  profession: "Engineering manager at a SaaS company",
  matchmakerId: "B",
  createdAt: "2026-11-16T06:30:00.000Z",
  summary:
    "Ishaan wants a fun, easy-going partner in Delhi NCR or Bangalore who loves dogs and laughs easily. Non-smoking is firm because of his asthma. He wants two children within three years of marriage.",
  preferences: [
    pref("ishaan-p1", "age_height", "Age 26 to 31", SOFT, "Age range: 26 to 31"),
    pref("ishaan-p2", "marital_status", "Never married", SOFT, "Marital status: Never married"),
    pref("ishaan-p3", "location", "Delhi NCR preferred, Bangalore works too", SOFT, "Delhi NCR preferred, Bangalore also works."),
    pref("ishaan-p4", "religion_community", "Hindu, not very religious", SOFT, "Hindu, but I'm not very religious myself"),
    pref("ishaan-p5", "language", "Hindi and English", SOFT, "Languages: Hindi and English"),
    pref("ishaan-p6", "education", "Graduate, any field", SOFT, "Graduate, any field"),
    pref("ishaan-p7", "profession_income", "Ideally working", SOFT, "Ideally working, any field."),
    pref("ishaan-p8", "lifestyle", "Non-smoker only (he has asthma)", DB, "Non-smoker only, I have asthma."),
    pref("ishaan-p9", "lifestyle", "Sporty would be lovely", SOFT, "would love someone sporty"),
    pref("ishaan-p10", "family", "Live independently, close to both families", SOFT, "Want to live independently, but close to both families."),
    pref("ishaan-p11", "children", "Two children within 3 years of marriage", SOFT, "Yes, two, within 3 years of marriage."),
    pref("ishaan-p12", "values_personality", "Fun, easy-going, a good listener", SOFT, "Someone fun, easy-going and a good listener."),
    pref("ishaan-p13", "other", "Must like dogs (he has a beagle)", DB, "anyone who doesn't like dogs"),
    pref("ishaan-p14", "values_personality", "Kind to everyone, including waiters", DB, "people who are rude to waiters"),
  ],
  followUps: [],
});

/** READY: divorced client, everything reviewed. */
const meera = build({
  id: "meera-joshi",
  clientName: "Meera Joshi",
  age: 34,
  city: "Pune",
  profession: "Architect, runs her own studio",
  matchmakerId: "B",
  createdAt: "2026-10-28T09:00:00.000Z",
  summary:
    "Meera is divorced and values calm, honesty and good communication. Her partner must live in Pune, never smoke, and never judge her divorce. She's open on religion, marital history and children.",
  preferences: [
    pref("meera-p1", "age_height", "Age 33 to 42", SOFT, "Age range: 33 to 42", "confirmed"),
    pref("meera-p2", "marital_status", "Divorced or never married, open to a partner with a child", SOFT, "Divorced or never married, both fine. Open to someone with a child.", "confirmed"),
    pref("meera-p3", "location", "Lives in Pune", DB, "Must be in Pune. I run my own studio here.", "confirmed"),
    pref("meera-p4", "religion_community", "Any religion, must respect hers", SOFT, "Any religion, but must respect mine.", "edited", "Open to interfaith; respect for her faith is the key."),
    pref("meera-p5", "language", "Marathi would be lovely", SOFT, "Marathi would be lovely, not essential.", "confirmed"),
    pref("meera-p6", "education", "Postgraduate preferred", SOFT, "Education: Postgraduate preferred", "confirmed"),
    pref("meera-p7", "profession_income", "Financially independent", DB, "Should be financially independent.", "edited"),
    pref("meera-p8", "lifestyle", "Vegetarian preferred, flexible", SOFT, "Vegetarian preferred, but I'm flexible.", "confirmed"),
    pref("meera-p9", "lifestyle", "No smoking", DB, "No smoking, non-negotiable.", "confirmed"),
    pref("meera-p10", "lifestyle", "Occasional wine is fine", SOFT, "Occasional wine is fine.", "confirmed"),
    pref("meera-p11", "children", "Open to one child or adoption, not a must", SOFT, "Open to one child, or adoption. Not a must.", "confirmed"),
    pref("meera-p12", "values_personality", "Emotionally secure, honest, communicates well", SOFT, "Emotionally secure, honest, and someone who communicates well.", "confirmed"),
    pref("meera-p13", "values_personality", "Doesn't judge her for being divorced", DB, "Anyone who judges me for being divorced.", "confirmed"),
    pref("meera-p14", "other", "Loves music and old Hindi films", SOFT, "Should love music and old Hindi films.", "confirmed"),
  ],
  followUps: [
    {
      id: "meera-f1",
      question: "Would you be open to a partner from a different religion, as long as he respects yours?",
      reason: "\"Any religion, but must respect mine\" could mean open to interfaith, or a quiet preference for Hindu. Worth checking before sharing profiles.",
      relatedPreferenceIds: ["meera-p4"],
      status: "resolved",
      resolutionNote: "Yes, fully open to interfaith. Respect for her faith is what matters.",
    },
  ],
  extraLog: [
    { at: "2026-10-29T07:15:00.000Z", kind: "moved", summary: "Moved \"Financially independent\" to deal-breakers", before: "Soft rule", after: "Deal-breaker" },
    { at: "2026-10-29T07:16:00.000Z", kind: "confirmed_all", summary: "Confirmed all deal-breakers (4)" },
    { at: "2026-11-01T12:30:00.000Z", kind: "followup_resolved", summary: "Resolved: \"Would you be open to a partner from a different religion…\"", after: "Yes, fully open to interfaith. Respect for her faith is what matters." },
    { at: "2026-11-01T12:32:00.000Z", kind: "edited", summary: "Added detail to \"Any religion, must respect hers\"", before: "(no detail)", after: "Open to interfaith; respect for her faith is the key." },
    { at: "2026-11-02T05:45:00.000Z", kind: "confirmed_all", summary: "Confirmed all soft rules (10)" },
  ],
});

/** NEEDS FOLLOW-UP: lots of vague answers ("settled", "not too religious", "good family"). */
const priya = build({
  id: "priya-sharma",
  clientName: "Priya Sharma",
  age: 28,
  city: "Delhi",
  profession: "Corporate lawyer at a Tier-1 firm",
  matchmakerId: "B",
  createdAt: "2026-11-11T08:10:00.000Z",
  summary:
    "Priya wants a mature, tall partner who \"has his life sorted\" and is never controlling. Many answers are vague (settled, not too religious, good family), so a short call is needed before shortlisting.",
  preferences: [
    pref("priya-p1", "age_height", "Age 29 to 34", SOFT, "Age range: 29 to 34", "confirmed"),
    pref("priya-p2", "age_height", "Tall", SOFT, "Height: Tall"),
    pref("priya-p3", "marital_status", "Never married", SOFT, "Marital status: Never married", "confirmed"),
    pref("priya-p4", "location", "Delhi, or anywhere if he's settled", SOFT, "Delhi, or anywhere if he's settled."),
    pref("priya-p5", "religion_community", "Not too religious", SOFT, "Not too religious."),
    pref("priya-p6", "language", "Hindi and English", SOFT, "Languages: Hindi, English", "confirmed"),
    pref("priya-p7", "education", "Well educated", SOFT, "Well educated"),
    pref("priya-p8", "profession_income", "Settled, with a good income", SOFT, "Settled, with a good income."),
    pref("priya-p9", "lifestyle", "Prefers a non-smoker", SOFT, "Prefer a non-smoker."),
    pref("priya-p10", "lifestyle", "Okay with drinking", SOFT, "Okay with drinking."),
    pref("priya-p11", "family", "Good family background", SOFT, "Good family background, decent and educated people."),
    pref("priya-p12", "children", "Wants children in the next 3 to 5 years", SOFT, "Want kids someday.", "edited"),
    pref("priya-p13", "values_personality", "Mature, kind, has his life sorted", SOFT, "Someone mature, who has his life sorted, and is a good human being."),
    pref("priya-p14", "values_personality", "Not controlling", DB, "No one who is controlling.", "confirmed"),
  ],
  followUps: [
    {
      id: "priya-f1",
      question: "What does \"settled\" mean for you: a stable job, a certain income, owning a home, or something else?",
      reason: "\"Settled, with a good income\" and \"anywhere if he's settled\" are too vague to act on. Location depends on it too.",
      relatedPreferenceIds: ["priya-p8", "priya-p4"],
      status: "open",
    },
    {
      id: "priya-f2",
      question: "How would you describe \"not too religious\"? For example, fine with festivals and family rituals, but no daily puja?",
      reason: "\"Not too religious\" can mean very different things to different families.",
      relatedPreferenceIds: ["priya-p5"],
      status: "open",
    },
    {
      id: "priya-f3",
      question: "Roughly when would you like to start a family?",
      reason: "\"Want kids someday\" doesn't give a timeline to match on.",
      relatedPreferenceIds: ["priya-p12"],
      status: "resolved",
      resolutionNote: "Within 3 to 5 years of marriage.",
    },
  ],
  extraLog: [
    { at: "2026-11-13T06:20:00.000Z", kind: "confirmed", summary: "Confirmed \"Not controlling\"" },
    { at: "2026-11-15T10:05:00.000Z", kind: "followup_resolved", summary: "Resolved: \"Roughly when would you like to start a family?\"", after: "Within 3 to 5 years of marriage." },
    { at: "2026-11-15T10:06:00.000Z", kind: "edited", summary: "Edited a children preference", before: "Wants children someday", after: "Wants children in the next 3 to 5 years" },
    { at: "2026-11-15T10:08:00.000Z", kind: "confirmed", summary: "Confirmed 3 soft rules" },
  ],
});

/** NEW: divorced single father, nothing reviewed yet. */
const siddharth = build({
  id: "siddharth-nair",
  clientName: "Siddharth Nair",
  age: 38,
  city: "Bangalore",
  profession: "Founder of a climate-tech startup",
  matchmakerId: "B",
  createdAt: "2026-11-18T04:45:00.000Z",
  summary:
    "Siddharth is divorced and raising his 6-year-old daughter with his mother's help. His partner must be warm with his daughter and comfortable living with them, and no smoking at all. Open on religion, diet and marital history.",
  preferences: [
    pref("siddharth-p1", "age_height", "Age 30 to 38", SOFT, "Age range: 30 to 38"),
    pref("siddharth-p2", "marital_status", "Divorced, widowed or never married, all fine", SOFT, "Divorced, widowed or never married, all fine"),
    pref("siddharth-p3", "location", "Bangalore", SOFT, "Location: Bangalore"),
    pref("siddharth-p4", "religion_community", "Any religion or community", SOFT, "Religion / community: Any"),
    pref("siddharth-p5", "language", "English is enough", SOFT, "English is enough"),
    pref("siddharth-p6", "education", "Graduate", SOFT, "Education: Graduate"),
    pref("siddharth-p7", "profession_income", "Passionate about something, any field", SOFT, "Any, as long as she's passionate about something."),
    pref("siddharth-p8", "lifestyle", "No smoking at all", DB, "No smoking at all, because of my daughter."),
    pref("siddharth-p9", "lifestyle", "Vegetarian or non-vegetarian, both fine", SOFT, "Vegetarian or non-vegetarian, both fine."),
    pref("siddharth-p10", "lifestyle", "Occasional drinking is fine", SOFT, "Drinking: Occasional is fine."),
    pref("siddharth-p11", "family", "Comfortable living with his mother", SOFT, "My mother lives with us and helps with my daughter."),
    pref("siddharth-p12", "children", "Warm with his daughter, happy to parent her", DB, "My partner must be warm with my daughter and happy to be a parent to her."),
    pref("siddharth-p13", "children", "Open to one more child", SOFT, "Open to one more child."),
    pref("siddharth-p14", "values_personality", "Grounded, kind, patient", SOFT, "Grounded, kind and patient."),
    pref("siddharth-p15", "children", "Comfortable with his daughter living with them", DB, "anyone who isn't comfortable with my daughter living with us"),
  ],
  followUps: [],
});

export const MOCK_PORTFOLIOS: Portfolio[] = [ananya, rohan, kavya, arjun, ishaan, meera, priya, siddharth];
