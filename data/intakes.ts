/**
 * Every client's filled STANDARD intake form (tdc-intake-v1), plus what the AI adds when it sorts it:
 * free-text preferences, a summary and follow-up questions. All names and details are made up.
 *
 * The form files in /public are generated from this file (npm run build:demo-data),
 * so every form follows the template exactly and every source quote matches.
 */
import type { DemoSortInput } from "@/lib/demo-sorting";
import type { FilledIntake, IntakeAnswer } from "@/lib/intake-form";

const DB = (answer: string): IntakeAnswer => ({ answer, importance: "Deal-breaker" });
const NH = (answer: string): IntakeAnswer => ({ answer, importance: "Nice to have" });
const DM = (answer: string): IntakeAnswer => ({ answer, importance: "Doesn't matter" });

export type ClientIntake = {
  clientName: string;
  /** The filled standard form. Missing when the client sent something else. */
  intake?: FilledIntake;
  /** The file's text, for files that aren't the standard form. */
  rawText?: string;
  sort: Omit<DemoSortInput, "intake">;
};

// =====================================================================
// Mock clients (Matchmaker A: Ananya, Rohan, Kavya, Arjun · B: Ishaan, Meera, Priya, Siddharth)
// =====================================================================

export const MOCK_INTAKES = {
  "ananya-iyer": {
    clientName: "Ananya Iyer",
    intake: {
      answers: {
        name: "Ananya Iyer", age: "29", city: "Bangalore, India", profession: "Product designer at a fintech startup",
        education: "Postgraduate", own_marital: "Never married", own_religion: "Hindu, Tamil Iyer", own_tongue: "Tamil",
        age_range: DB("29 to 35"), height_range: NH("5'8\" to 6'2\""),
        marital_open: DB("Never married"),
        partner_location: DB("These cities: Bangalore"), relocate: "No",
        partner_religion: NH("Hindu"), partner_community: DM("Any"), religiousness: NH("Moderately"),
        partner_languages: DB("English"), partner_tongue: NH("Specific: Tamil"),
        min_education: NH("Postgraduate"), education_fields: NH("Design or technology"),
        partner_work: DB("Working full-time"), min_income: DM("Any"),
        living_arrangement: DB("On our own, near family"), family_values: NH("Liberal"),
        diet: DB("Vegetarian only"), smoking: DB("Never"), drinking: NH("Socially"), fitness: NH("Very active"),
        wants_children: NH("Yes"), children_when: NH("2–4 years"), partner_has_children: DM("No"),
        describe: "Someone kind, curious and a little nerdy, who reads, travels and treats people well. Humour is very important to me.",
        definite_no: "Anyone who expects me to quit my job after marriage.",
        other: "I trek most weekends, so someone who enjoys the outdoors would be lovely.",
      },
      notes: {
        family: "I don't want to live with in-laws. Ideally not too far from my parents in Chennai.",
      },
    },
    sort: {
      summary:
        "Ananya wants a kind, curious, slightly nerdy partner in Bangalore who backs her career. Vegetarian, non-smoking and living on their own are firm. Warm, active and funny will win her over.",
      details: { living_arrangement: "She doesn't want to live with in-laws." },
      freeText: [
        { key: "x1", category: "values_personality", label: "Kind, curious, a little nerdy", type: "soft_rule", sourceQuote: "Someone kind, curious and a little nerdy, who reads, travels and treats people well." },
        { key: "x2", category: "values_personality", label: "Good sense of humour", type: "soft_rule", sourceQuote: "Humour is very important to me." },
        { key: "x3", category: "profession_income", label: "Supports her career after marriage", type: "deal_breaker", sourceQuote: "Anyone who expects me to quit my job after marriage." },
        { key: "x4", category: "other", label: "Enjoys the outdoors", type: "soft_rule", sourceQuote: "someone who enjoys the outdoors would be lovely" },
      ],
      followUps: [
        {
          question: "Should we also look at partners in Chennai, or is Bangalore a must?",
          reason: "Location is a deal-breaker (\"These cities: Bangalore\"), but her family note says \"ideally not too far from my parents in Chennai\".",
          related: ["partner_location"],
        },
      ],
    },
  },

  "rohan-mehta": {
    clientName: "Rohan Mehta",
    intake: {
      answers: {
        name: "Rohan Mehta", age: "33", city: "Mumbai, India", profession: "Vice President, investment banking",
        education: "Postgraduate", own_marital: "Never married", own_religion: "Hindu, Gujarati", own_tongue: "Gujarati",
        age_range: NH("26 to 31"), height_range: NH("5'3\" to 5'8\""),
        marital_open: DB("Never married"),
        partner_location: DB("My city (Mumbai)"), relocate: "No",
        partner_religion: DB("Hindu"), partner_community: DB("Specific: Gujarati"), religiousness: NH("Moderately"),
        partner_languages: NH("Gujarati, Hindi, English"), partner_tongue: DM("Any"),
        min_education: NH("Graduate"), education_fields: NH("MBA or CA"),
        partner_work: DM("Homemaker is fine"), min_income: DM("Any"),
        living_arrangement: DB("With my parents"), family_values: NH("Traditional"),
        diet: NH("Vegetarian or eggetarian"), smoking: DB("Never"), drinking: NH("Occasionally"), fitness: DM("Not important"),
        wants_children: NH("Yes"), children_when: NH("5+ years"), partner_has_children: DB("No"),
        describe: "I want someone from a good family background who is warm with my parents. Honestly, community is not that important to me, values matter more. Someone grounded but ambitious.",
        definite_no: "Someone who doesn't respect elders.",
        other: "My grandmother lives with us too.",
      },
      notes: { family: "We live with my parents and grandmother." },
    },
    sort: {
      summary:
        "Rohan wants a warm, grounded partner in Mumbai who is happy living with his parents and grandmother. He marked a Gujarati community as a deal-breaker, but also wrote that values matter more than community, so that needs clearing up.",
      freeText: [
        { key: "x1", category: "family", label: "Good family background", type: "soft_rule", sourceQuote: "I want someone from a good family background who is warm with my parents." },
        { key: "x2", category: "values_personality", label: "Values matter more than community", type: "soft_rule", sourceQuote: "community is not that important to me, values matter more" },
        { key: "x3", category: "values_personality", label: "Grounded but ambitious", type: "soft_rule", sourceQuote: "Someone grounded but ambitious." },
        { key: "x4", category: "values_personality", label: "Respects elders", type: "deal_breaker", sourceQuote: "Someone who doesn't respect elders." },
        { key: "x5", category: "family", label: "Comfortable living with his grandmother too", type: "soft_rule", sourceQuote: "My grandmother lives with us too." },
      ],
      followUps: [
        {
          question: "Is a Gujarati family a must, or would you meet someone from another community with similar values?",
          reason: "\"Partner's community: Gujarati\" is marked Deal-breaker, but he also wrote \"community is not that important to me, values matter more\".",
          related: ["partner_community", "x2"],
        },
        {
          question: "When you say \"good family background\", what matters most to you: education, values, financial standing, or something else?",
          reason: "\"Good family background\" is too vague to use when picking profiles.",
          related: ["x1"],
        },
      ],
    },
  },

  "kavya-reddy": {
    clientName: "Kavya Reddy",
    intake: {
      answers: {
        name: "Kavya Reddy", age: "27", city: "Hyderabad, India", profession: "Paediatrics resident doctor",
        education: "Professional degree (CA, MBBS, LLB…)", own_marital: "Never married", own_religion: "Hindu, Reddy", own_tongue: "Telugu",
        age_range: NH("28 to 33"), height_range: NH("5'6\" to 6'2\""),
        marital_open: NH("Never married"),
        partner_location: NH("These cities: Hyderabad, Bangalore"), relocate: "Yes, within India",
        partner_religion: NH("Hindu"), partner_community: DM("Any"), religiousness: DM("Moderately"),
        partner_languages: NH("English, Telugu"), partner_tongue: NH("Same as mine"),
        min_education: DB("Postgraduate"), education_fields: NH("Medicine"),
        partner_work: DB("Working full-time"), min_income: DM("Any"),
        living_arrangement: NH("With partner's parents"), family_values: NH("Moderate"),
        diet: DM("Non-vegetarian is fine"), smoking: DB("Never"), drinking: NH("Occasionally"), fitness: DM("Not important"),
        wants_children: DB("Yes"), children_when: DB("2–4 years"), partner_has_children: NH("No"),
        describe: "Someone patient and emotionally mature, who is proud of my career and shares the load at home.",
        definite_no: "Anyone who thinks a wife should cook every day.",
      },
      notes: {
        profession_income: "Should understand long working hours, I have night shifts.",
        children: "Only after I finish my residency in 2028.",
      },
    },
    sort: {
      summary:
        "Kavya is a resident doctor looking for a patient, emotionally mature partner who is proud of her career and shares the load at home. A postgraduate, working, non-smoking partner is firm, and children come after her residency ends in 2028.",
      details: { children_when: "Only after her residency ends in 2028." },
      freeText: [
        { key: "x1", category: "values_personality", label: "Patient, emotionally mature, proud of her career", type: "soft_rule", sourceQuote: "Someone patient and emotionally mature, who is proud of my career" },
        { key: "x2", category: "values_personality", label: "Shares housework, no traditional cooking expectations", type: "deal_breaker", sourceQuote: "Anyone who thinks a wife should cook every day." },
        { key: "x3", category: "profession_income", label: "Understands long hours and night shifts", type: "soft_rule", sourceQuote: "Should understand long working hours, I have night shifts." },
      ],
      followUps: [],
    },
  },

  "arjun-malhotra": {
    clientName: "Arjun Malhotra",
    intake: {
      answers: {
        name: "Arjun Malhotra", age: "36", city: "London, UK", profession: "Management consultant, Associate Partner",
        education: "Postgraduate", own_marital: "Never married", own_religion: "Hindu, Punjabi Khatri", own_tongue: "Punjabi",
        age_range: NH("29 to 35"), height_range: NH("5'4\" to 5'10\""),
        marital_open: NH("Never married, Divorced"),
        partner_location: DB("These cities: London"), relocate: "No",
        partner_religion: NH("Hindu, Sikh"), partner_community: NH("Specific: Punjabi"), religiousness: DM("Not very"),
        partner_languages: DB("Hindi, English"), partner_tongue: NH("Specific: Punjabi"),
        min_education: NH("Postgraduate"), education_fields: DM("Any"),
        partner_work: DB("Working or planning to work"), min_income: DM("Any"),
        living_arrangement: NH("On our own"), family_values: NH("Liberal"),
        diet: DM("Non-vegetarian is fine"), smoking: DB("Never"), drinking: NH("Socially"), fitness: NH("Very active"),
        wants_children: NH("Not sure"), children_when: NH("Not sure"), partner_has_children: NH("Depends"),
        describe: "Independent, well-travelled, confident. Someone who will make London feel like home.",
        definite_no: "Someone who won't move abroad.",
      },
      notes: {
        location: "She must be willing to move to London. I'm settled here and won't move back.",
        language: "My parents don't speak much English.",
        profession_income: "She would need a UK work visa.",
        family: "My parents live in Delhi and visit for 3 months every year.",
      },
    },
    sort: {
      summary:
        "Arjun has lived in London since 2015 and wants an independent, well-travelled partner who will move there and keep working. She must speak Hindi for his parents. He hasn't decided about children yet.",
      details: { partner_location: "She must be willing to move; he won't move back." },
      freeText: [
        { key: "x1", category: "values_personality", label: "Independent, well-travelled, confident", type: "soft_rule", sourceQuote: "Independent, well-travelled, confident." },
        { key: "x2", category: "family", label: "Comfortable with his parents visiting 3 months a year", type: "soft_rule", sourceQuote: "My parents live in Delhi and visit for 3 months every year." },
      ],
      followUps: [
        {
          question: "Would you like children, and if so, roughly when? It's one of the first things matches will ask.",
          reason: "He answered \"Not sure\" to both children questions, which is too open to filter profiles on.",
          related: ["wants_children", "children_when"],
        },
        {
          question: "Does she need to already have a UK work visa, or would you sponsor one?",
          reason: "\"She would need a UK work visa\" could rule out most India-based profiles if read as a requirement.",
          related: ["partner_work"],
        },
      ],
    },
  },

  "ishaan-kapoor": {
    clientName: "Ishaan Kapoor",
    intake: {
      answers: {
        name: "Ishaan Kapoor", age: "31", city: "Gurgaon, India", profession: "Engineering manager at a SaaS company",
        education: "Graduate", own_marital: "Never married", own_religion: "Hindu, Punjabi", own_tongue: "Hindi",
        age_range: NH("26 to 31"), height_range: DM("No preference"),
        marital_open: NH("Never married"),
        partner_location: NH("These cities: Delhi NCR, Bangalore"), relocate: "Yes, within India",
        partner_religion: NH("Hindu"), partner_community: DM("Any"), religiousness: NH("Not very"),
        partner_languages: NH("Hindi, English"), partner_tongue: DM("Any"),
        min_education: NH("Graduate"), education_fields: DM("Any"),
        partner_work: NH("Working or planning to work"), min_income: DM("Any"),
        living_arrangement: NH("On our own, near family"), family_values: NH("Liberal"),
        diet: DM("Non-vegetarian is fine"), smoking: DB("Never"), drinking: DM("Fine"), fitness: NH("Very active"),
        wants_children: NH("Yes"), children_when: NH("2–4 years"), partner_has_children: NH("No"),
        describe: "Someone fun, easy-going and a good listener. We should be able to laugh at ourselves.",
        definite_no: "People who are rude to waiters, and anyone who doesn't like dogs.",
        other: "I have a beagle called Mango.",
      },
      notes: { lifestyle: "I have asthma, so no smoking around me." },
    },
    sort: {
      summary:
        "Ishaan wants a fun, easy-going partner in Delhi NCR or Bangalore who loves dogs and laughs easily. Non-smoking is firm because of his asthma. He'd like two children within a few years of marriage.",
      details: { smoking: "He has asthma." },
      freeText: [
        { key: "x1", category: "values_personality", label: "Fun, easy-going, a good listener", type: "soft_rule", sourceQuote: "Someone fun, easy-going and a good listener." },
        { key: "x2", category: "values_personality", label: "Kind to everyone, including waiters", type: "deal_breaker", sourceQuote: "People who are rude to waiters" },
        { key: "x3", category: "other", label: "Likes dogs (he has a beagle)", type: "deal_breaker", sourceQuote: "anyone who doesn't like dogs" },
      ],
      followUps: [],
    },
  },

  "meera-joshi": {
    clientName: "Meera Joshi",
    intake: {
      answers: {
        name: "Meera Joshi", age: "34", city: "Pune, India", profession: "Architect, runs her own studio",
        education: "Postgraduate", own_marital: "Divorced", own_religion: "Hindu, Maharashtrian Brahmin", own_tongue: "Marathi",
        age_range: NH("33 to 42"), height_range: DM("No preference"),
        marital_open: NH("Never married, Divorced, Widowed"),
        partner_location: DB("My city (Pune)"), relocate: "No",
        partner_religion: NH("Any"), partner_community: DM("Any"), religiousness: NH("Moderately"),
        partner_languages: NH("English, Hindi"), partner_tongue: NH("Specific: Marathi"),
        min_education: NH("Postgraduate"), education_fields: DM("Any"),
        partner_work: DB("Working full-time"), min_income: DM("Any"),
        living_arrangement: NH("On our own, near family"), family_values: NH("Liberal"),
        diet: NH("Vegetarian or eggetarian"), smoking: DB("Never"), drinking: NH("Occasionally"), fitness: DM("Not important"),
        wants_children: NH("Not sure"), children_when: DM("Not sure"), partner_has_children: NH("Yes"),
        describe: "Emotionally secure, honest, and someone who communicates well. After my divorce I value calm over excitement.",
        definite_no: "Anyone who judges me for being divorced.",
        other: "Should love music and old Hindi films.",
      },
      notes: {
        location: "I run my own studio here.",
        religion_community: "Any religion, but he must respect mine.",
        children: "Open to one child, or adoption. Not a must.",
      },
    },
    sort: {
      summary:
        "Meera is divorced and values calm, honesty and good communication. Her partner must live in Pune, work full-time, never smoke and never judge her divorce. She's open on religion, marital history and children.",
      freeText: [
        { key: "x1", category: "values_personality", label: "Emotionally secure, honest, communicates well", type: "soft_rule", sourceQuote: "Emotionally secure, honest, and someone who communicates well." },
        { key: "x2", category: "values_personality", label: "Doesn't judge her for being divorced", type: "deal_breaker", sourceQuote: "Anyone who judges me for being divorced." },
        { key: "x3", category: "other", label: "Loves music and old Hindi films", type: "soft_rule", sourceQuote: "Should love music and old Hindi films." },
      ],
      followUps: [
        {
          question: "Would you be open to a partner from a different religion, as long as he respects yours?",
          reason: "\"Partner's religion: Any\" is clear, but her note \"he must respect mine\" sounds firm. Worth checking before sharing interfaith profiles.",
          related: ["partner_religion"],
        },
        {
          question: "You said \"Not sure\" about children. Would you like them, or is it genuinely open?",
          reason: "\"Do you want children? Not sure\" is too open to match on.",
          related: ["wants_children"],
        },
      ],
    },
  },

  "priya-sharma": {
    clientName: "Priya Sharma",
    intake: {
      answers: {
        name: "Priya Sharma", age: "28", city: "Delhi, India", profession: "Corporate lawyer at a Tier-1 firm",
        education: "Professional degree (CA, MBBS, LLB…)", own_marital: "Never married", own_religion: "Hindu, Brahmin", own_tongue: "Hindi",
        age_range: NH("29 to 34"), height_range: NH("5'10\" to 6'3\""),
        marital_open: NH("Never married"),
        partner_location: NH("These cities: Delhi"), relocate: "Yes, within India",
        partner_religion: NH("Hindu"), partner_community: DM("Any"), religiousness: NH("Not very"),
        partner_languages: NH("Hindi, English"), partner_tongue: DM("Any"),
        min_education: NH("Postgraduate"), education_fields: DM("Any"),
        partner_work: NH("Working full-time"), min_income: NH("50 LPA+"),
        living_arrangement: NH("On our own"), family_values: NH("Moderate"),
        diet: DM("Non-vegetarian is fine"), smoking: NH("Never"), drinking: DM("Fine"), fitness: DM("Not important"),
        wants_children: NH("Yes"), children_when: NH("Not sure"), partner_has_children: NH("No"),
        describe: "Someone mature, who has his life sorted, and is a good human being.",
        definite_no: "No one who is controlling.",
      },
      notes: {
        location: "Or anywhere, if he's settled.",
        profession_income: "Settled, with a good income.",
        family: "Good family background, decent and educated people.",
      },
    },
    sort: {
      summary:
        "Priya wants a mature partner who \"has his life sorted\" and is never controlling. Several answers rely on vague words (settled, good family), so a short call is needed before shortlisting.",
      freeText: [
        { key: "x1", category: "values_personality", label: "Mature, has his life sorted", type: "soft_rule", sourceQuote: "Someone mature, who has his life sorted, and is a good human being." },
        { key: "x2", category: "values_personality", label: "Not controlling", type: "deal_breaker", sourceQuote: "No one who is controlling." },
        { key: "x3", category: "family", label: "Good family background", type: "soft_rule", sourceQuote: "Good family background, decent and educated people." },
        { key: "x4", category: "profession_income", label: "Settled, with a good income", type: "soft_rule", sourceQuote: "Settled, with a good income." },
      ],
      followUps: [
        {
          question: "What does \"settled\" mean for you: a stable job, a certain income, owning a home, or something else?",
          reason: "\"Settled\" appears in her income and location answers, and location depends on it (\"Or anywhere, if he's settled\").",
          related: ["x4", "partner_location"],
        },
        {
          question: "When you say \"good family background\", what matters most to you?",
          reason: "\"Good family background\" is too vague to act on.",
          related: ["x3"],
        },
        {
          question: "Roughly when would you like to start a family?",
          reason: "\"When? Not sure\" doesn't give a timeline to match on.",
          related: ["children_when"],
        },
      ],
    },
  },

  "siddharth-nair": {
    clientName: "Siddharth Nair",
    intake: {
      answers: {
        name: "Siddharth Nair", age: "38", city: "Bangalore, India", profession: "Founder of a climate-tech startup",
        education: "Postgraduate", own_marital: "Divorced", own_religion: "Hindu, Nair", own_tongue: "Malayalam",
        age_range: NH("30 to 38"), height_range: DM("No preference"),
        marital_open: NH("Never married, Divorced, Widowed"),
        partner_location: NH("My city (Bangalore)"), relocate: "No",
        partner_religion: DM("Any"), partner_community: DM("Any"), religiousness: DM("Moderately"),
        partner_languages: NH("English"), partner_tongue: DM("Any"),
        min_education: NH("Graduate"), education_fields: DM("Any"),
        partner_work: NH("Working or planning to work"), min_income: DM("Any"),
        living_arrangement: DB("With my parents"), family_values: NH("Moderate"),
        diet: DM("Non-vegetarian is fine"), smoking: DB("Never"), drinking: NH("Occasionally"), fitness: DM("Not important"),
        wants_children: NH("Yes"), children_when: NH("2–4 years"), partner_has_children: NH("Yes"),
        describe: "Grounded, kind and patient. Someone who enjoys a quiet weekend at home as much as a trip.",
        definite_no: "Anyone who isn't comfortable with my daughter living with us.",
      },
      notes: {
        family: "My mother lives with us and helps with my daughter (6).",
        lifestyle: "No smoking at all, because of my daughter.",
        children: "My partner must be warm with my daughter and happy to be a parent to her. Open to one more child.",
      },
    },
    sort: {
      summary:
        "Siddharth is divorced and raising his 6-year-old daughter with his mother's help. His partner must be comfortable living with them and must not smoke. He's open on religion, diet and marital history.",
      details: { living_arrangement: "His mother lives with them and helps with his daughter." },
      freeText: [
        { key: "x1", category: "values_personality", label: "Grounded, kind and patient", type: "soft_rule", sourceQuote: "Grounded, kind and patient." },
        { key: "x2", category: "children", label: "Comfortable with his daughter living with them", type: "deal_breaker", sourceQuote: "Anyone who isn't comfortable with my daughter living with us." },
        { key: "x3", category: "children", label: "Warm with his daughter, happy to parent her", type: "soft_rule", sourceQuote: "My partner must be warm with my daughter and happy to be a parent to her." },
      ],
      followUps: [
        {
          question: "Should \"warm with my daughter and happy to parent her\" be a deal-breaker?",
          reason: "It's written as \"must\" in a section note, which has no importance mark, so it's a soft rule for now.",
          related: ["x3"],
        },
      ],
    },
  },
} satisfies Record<string, ClientIntake>;

export type MockClientId = keyof typeof MOCK_INTAKES;

// =====================================================================
// Sample files used on the New portfolio page
// =====================================================================

export const SAMPLE_INTAKES = {
  /**
   * THE sample: TDC's standard form filled by a sample client. Tests contradictions (Mumbai only vs
   * moving abroad; age 25–28 vs 10+ years' experience; vegetarian vs sushi) and an importance mark that
   * clashes with the client's own wording (smoking marked "Nice to have", note says "absolutely no smokers").
   */
  "standard-sample": {
    clientName: "Vikram Sethi",
    intake: {
      answers: {
        name: "Vikram Sethi", age: "34", city: "Mumbai, India", profession: "Chartered accountant, partner at an audit firm",
        education: "Professional degree (CA, MBBS, LLB…)", own_marital: "Never married", own_religion: "Hindu, Punjabi", own_tongue: "Punjabi",
        age_range: DB("25 to 28"), height_range: NH("5'2\" to 5'7\""),
        marital_open: DB("Never married"),
        partner_location: DB("My city (Mumbai)"), relocate: "Yes, abroad too",
        partner_religion: NH("Hindu"), partner_community: NH("Specific: Punjabi"), religiousness: NH("Moderately"),
        partner_languages: NH("Hindi, English"), partner_tongue: DM("Any"),
        min_education: NH("Professional degree"), education_fields: NH("CA, MBA or law"),
        partner_work: DB("Working full-time"), min_income: DM("Any"),
        living_arrangement: DB("With my parents"), family_values: NH("Traditional"),
        diet: DB("Vegetarian only"), smoking: NH("Never"), drinking: NH("Socially"), fitness: NH("Very active"),
        wants_children: NH("Yes"), children_when: NH("5+ years"), partner_has_children: NH("No"),
        describe: "Someone confident and independent who has seen the world. Honestly, I'm also open to moving abroad for the right person, I've always wanted to live in London for a few years. I'd love a partner who'll try sushi and street food with me anywhere we go.",
        definite_no: "Anyone who doesn't get along with my parents.",
      },
      notes: {
        location: "My practice is here and I'm not moving.",
        profession_income: "I want someone well established in her career, ideally with 10+ years of work experience.",
        lifestyle: "Absolutely no smokers, not even socially. My father smoked and I've seen what it does.",
      },
    },
    sort: {
      summary:
        "Vikram wants a confident, independent, well-travelled partner who is happy living with his parents in a vegetarian home. Several answers pull in different directions (Mumbai only vs moving abroad, a young age range vs 10+ years' experience), and he marked non-smoking as only \"Nice to have\" while writing \"absolutely no smokers\", so these need clearing up before shortlisting.",
      details: { smoking: "His note: \"Absolutely no smokers, not even socially.\"" },
      freeText: [
        { key: "x1", category: "values_personality", label: "Confident, independent, well-travelled", type: "soft_rule", sourceQuote: "Someone confident and independent who has seen the world." },
        { key: "x2", category: "location", label: "Open to moving abroad for the right person", detail: "Would like to live in London for a few years.", type: "soft_rule", sourceQuote: "I'm also open to moving abroad for the right person" },
        { key: "x3", category: "profession_income", label: "Well established, 10+ years of work experience", type: "soft_rule", sourceQuote: "I want someone well established in her career, ideally with 10+ years of work experience." },
        { key: "x4", category: "other", label: "Tries sushi and street food", type: "soft_rule", sourceQuote: "I'd love a partner who'll try sushi and street food with me anywhere we go." },
        { key: "x5", category: "family", label: "Gets along with his parents", type: "deal_breaker", sourceQuote: "Anyone who doesn't get along with my parents." },
      ],
      followUps: [
        {
          question: "Is living in Mumbai a must, or would you genuinely move abroad for the right person?",
          reason: "\"My city (Mumbai)\" is a deal-breaker and his note says \"I'm not moving\", yet he answered \"Yes, abroad too\" and wrote \"open to moving abroad for the right person\".",
          related: ["partner_location", "x2"],
        },
        {
          question: "Someone aged 25 to 28 rarely has 10+ years of work experience. Which matters more: the age range or how established she is?",
          reason: "\"Partner's age range: 25 to 28\" (Deal-breaker) and \"10+ years of work experience\" can't both be true for most people.",
          related: ["age_range", "x3"],
        },
        {
          question: "Does \"Vegetarian only\" apply to home only? Sushi and street food often include meat or fish.",
          reason: "Diet is a deal-breaker (\"Vegetarian only\"), but he'd love a partner who tries sushi and street food with him.",
          related: ["diet", "x4"],
        },
        {
          question: "You marked a non-smoker as \"Nice to have\", but wrote \"Absolutely no smokers, not even socially\". Should this be a deal-breaker?",
          reason: "The client's importance mark (Nice to have) doesn't match his note. We kept his mark; please confirm with him.",
          related: ["smoking"],
        },
      ],
    },
  },

  /** Not the standard form: a free-form email. Download it from "Upload a file" and upload it to see the warning. */
  "non-standard-sample": {
    clientName: "Neha Iyengar",
    rawText: `From: Neha Iyengar
Subject: About me and what I'm looking for

Hi team,

As promised on our call, here's a bit about me and what I'm looking for. I'm 31, based in Chennai, and work as a chartered accountant at a Big Four firm.

I'd like to meet someone between 31 and 37, ideally in Chennai or Bangalore. I'm vegetarian and would prefer a vegetarian partner, though I'm not rigid about it. He must not smoke. Family is very important to me and I'm close to my parents.

I'd love someone who is kind, ambitious and loves travelling. I want children someday.

Thanks,
Neha
`,
    sort: {
      isStandardForm: false,
      formNote: "No form version, section numbers or importance marks were found. This looks like a free-form email.",
      clientDetails: { age: 31, city: "Chennai", profession: "Chartered accountant at a Big Four firm" },
      summary:
        "Neha (31, Chennai) wants a kind, ambitious partner who loves travelling, ideally vegetarian and in Chennai or Bangalore. She sent an email rather than the standard form, so nothing is marked by importance and several categories are missing.",
      freeText: [
        { key: "x1", category: "age_height", label: "Age 31 to 37", type: "soft_rule", sourceQuote: "someone between 31 and 37" },
        { key: "x2", category: "location", label: "Chennai or Bangalore", type: "soft_rule", sourceQuote: "ideally in Chennai or Bangalore" },
        { key: "x3", category: "lifestyle", label: "Vegetarian partner preferred", type: "soft_rule", sourceQuote: "would prefer a vegetarian partner, though I'm not rigid about it" },
        { key: "x4", category: "lifestyle", label: "Non-smoker", type: "soft_rule", sourceQuote: "He must not smoke." },
        { key: "x5", category: "family", label: "Close to her parents", type: "soft_rule", sourceQuote: "Family is very important to me and I'm close to my parents." },
        { key: "x6", category: "values_personality", label: "Kind, ambitious, loves travelling", type: "soft_rule", sourceQuote: "someone who is kind, ambitious and loves travelling" },
        { key: "x7", category: "children", label: "Wants children someday", type: "soft_rule", sourceQuote: "I want children someday." },
      ],
      followUps: [
        {
          question: "Could Neha fill in TDC's standard intake form? Her email skips religion, language, education, marital status and more.",
          reason: "This isn't the standard form, so many categories are missing and nothing has an importance mark.",
          related: [],
        },
        {
          question: "Is a non-smoker a deal-breaker?",
          reason: "\"He must not smoke\" sounds firm, but without an importance mark it's a soft rule for now.",
          related: ["x4"],
        },
        {
          question: "Roughly when would you like to have children?",
          reason: "\"I want children someday\" doesn't give a timeline to match on.",
          related: ["x7"],
        },
      ],
    },
  },
} satisfies Record<string, ClientIntake>;
