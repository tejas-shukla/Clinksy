// Single source of truth for the dashboard and the /guides pages.
// Mirrors the 10-stage UK home buying journey in content/uk-home-buying-journey.md.

import type { Stage } from "@/lib/auth";

export type ServiceType = "mortgage-broker" | "solicitor" | "surveyor";

export type DashboardStage = {
  id: number;
  slug: string;
  title: string;
  guideTitle: string;
  metaDescription: string;
  blurb: string;
  timescale: string;
  cost: string;
  whatHappens: string;
  watchOutFor: string[];
  actions: string[];
  needs: ServiceType[];
  faqs: { q: string; a: string }[];
};

export const DASHBOARD_STAGES: DashboardStage[] = [
  {
    id: 1,
    slug: "mortgage-in-principle-uk",
    title: "Work out how much you can borrow",
    guideTitle: "How much can I borrow? Mortgage Agreement in Principle, UK 2025",
    metaDescription:
      "Before house hunting, get a free Mortgage Agreement in Principle. Here's how UK lenders work out what to lend you, and how to boost your chances.",
    blurb: "Get clear on what you can afford before you start hunting.",
    timescale: "Up to a week",
    cost: "Free",
    whatHappens:
      "You assess your finances, get a free Agreement in Principle (AIP) from a lender, and lock in a comfortable monthly budget.",
    watchOutFor: [
      "Credit-card and car finance balances reduce what lenders will offer.",
      "Treating the AIP figure as your budget — it's the ceiling, not the comfortable number.",
      "Skipping a broker. They're usually free for first-time buyers and see deals your bank won't show you.",
    ],
    actions: [
      "Pull a free credit report (Experian, Equifax, ClearScore).",
      "Speak to a whole-of-market broker for an AIP.",
      "Decide your real walk-away monthly payment.",
    ],
    needs: ["mortgage-broker"],
    faqs: [
      {
        q: "What is a Mortgage Agreement in Principle?",
        a: "An Agreement in Principle (also called a Decision in Principle) is a soft-credit-check letter from a lender confirming roughly how much they'd be willing to lend you. It's free, takes a couple of days, and is typically valid for 30–90 days.",
      },
      {
        q: "How much can I borrow on a mortgage in the UK?",
        a: "Most UK lenders will offer 4 to 4.5 times your annual income, though some go to 5.5x for higher earners. Your existing debt, credit history, and the length of the mortgage term all affect the final number.",
      },
      {
        q: "Should I go to a broker or my bank?",
        a: "A whole-of-market mortgage broker sees deals from across the industry and is usually free for first-time buyers (paid by the lender). Your bank only sees its own products.",
      },
    ],
  },
  {
    id: 2,
    slug: "find-a-home-uk",
    title: "Find your home",
    guideTitle: "How to find your first home in the UK — a practical buyer's guide",
    metaDescription:
      "Where to search, what to ask the agent, and what to spot before you make an offer. The UK first-time buyer's guide to viewing and shortlisting.",
    blurb: "Search smartly — visits, viewings, area research.",
    timescale: "Two weeks to six months",
    cost: "Free (just your time)",
    whatHappens:
      "You search Rightmove, Zoopla, OnTheMarket, visit properties at different times of day, and shortlist.",
    watchOutFor: [
      "Falling in love before checking leasehold terms, EPC rating, or broadband speed.",
      "Ground rent and service charges on leasehold flats (£200+/month is common).",
      "Single-visit decisions — go back at different times if you can.",
    ],
    actions: [
      "Set up alerts on the portals for your postcode and budget.",
      "Book 5–10 viewings in your shortlist.",
      "Ask each agent why the seller is moving and how long it's been listed.",
    ],
    needs: [],
    faqs: [
      {
        q: "Which is the best UK property search site?",
        a: "Rightmove has the largest inventory; Zoopla shows sold-price history; OnTheMarket often gets new listings 24 hours before the others. Use all three plus the smaller PrimeLocation for higher-end properties.",
      },
      {
        q: "How many viewings should I do before making an offer?",
        a: "Most buyers see 10–25 properties before making a serious offer. View your shortlist at least twice, ideally at different times of day, before committing.",
      },
      {
        q: "What's the difference between freehold and leasehold?",
        a: "Freehold means you own the property and the land. Leasehold means you own the right to occupy it for a fixed term, usually paying ground rent and service charges to the freeholder. Most flats in England are leasehold.",
      },
    ],
  },
  {
    id: 3,
    slug: "make-an-offer-uk",
    title: "Make an offer",
    guideTitle: "How to make an offer on a UK property — what to say and how much",
    metaDescription:
      "How to negotiate, what to ask the agent, what conditions to attach, and how to protect yourself from gazumping before contracts exchange.",
    blurb: "Negotiate, get accepted, lock the property off the market.",
    timescale: "A day to two weeks",
    cost: "£0 to offer, plus £20–£60 for AML ID checks",
    whatHappens:
      "You offer, often go back and forth, get accepted, and the listing is marked Sold Subject to Contract. Not legally binding yet.",
    watchOutFor: [
      "Gazumping — until contracts exchange, the seller can accept a higher offer.",
      "Anti-money-laundering checks. £20–£60 from most estate agents.",
      "Forgetting to negotiate fixtures and fittings (curtains, white goods).",
    ],
    actions: [
      "Look up recent sold prices for the postcode on Land Registry (free).",
      "Make a written offer with conditions (off-market, fixtures included).",
      "Ask the seller to take it off the market once accepted.",
    ],
    needs: [],
    faqs: [
      {
        q: "How much under asking price should I offer?",
        a: "Common starting offers are 5–10% below asking, but it depends on demand. In a slow market, 10–15% is reasonable; in a hot market, asking or above is sometimes needed.",
      },
      {
        q: "What is gazumping and can I prevent it?",
        a: "Gazumping is when another buyer offers more and the seller accepts after yours was already accepted. You can't fully prevent it, but asking for the property to be taken off the market as a condition of your offer helps.",
      },
      {
        q: "Is a verbal offer binding?",
        a: "No. In England, Wales, and Northern Ireland, neither side is legally bound until contracts exchange. Always follow up a verbal offer with a written one for clarity.",
      },
    ],
  },
  {
    id: 4,
    slug: "mortgage-offer-uk",
    title: "Secure a mortgage offer",
    guideTitle: "Getting a mortgage offer in the UK — application to approval",
    metaDescription:
      "What lenders check, how long underwriting takes, and how to avoid the most common reasons UK mortgage applications get rejected.",
    blurb: "Formal underwriting, valuation, and a binding offer letter.",
    timescale: "Two to eight weeks",
    cost: "£0–£1,999 arrangement fee + possible booking/valuation fees",
    whatHappens:
      "Your broker submits the full application. The lender runs proper credit and income checks, has the property valued, then issues a formal mortgage offer (valid 3–6 months).",
    watchOutFor: [
      "Don't change jobs or open new credit during underwriting.",
      "Downvaluation — the lender values the property below the agreed price.",
      "Early repayment charges hidden in the small print.",
    ],
    actions: [
      "Submit P60, three months of payslips, bank statements, and ID.",
      "Cross-check the offer document against your original mortgage illustration.",
      "Confirm any conditions you need to meet before drawdown.",
    ],
    needs: ["mortgage-broker"],
    faqs: [
      {
        q: "How long does a UK mortgage offer take?",
        a: "Most lenders issue an offer within 2–6 weeks of receiving a complete application. Simple cases (PAYE income, clean credit) can be quicker; self-employed, contract or complex cases take longer.",
      },
      {
        q: "What is a downvaluation?",
        a: "A downvaluation is when the lender's surveyor values the property below the price you agreed with the seller. You then need to either find the shortfall in cash, renegotiate, or pull out.",
      },
      {
        q: "Can a mortgage offer be withdrawn?",
        a: "Yes — a lender can withdraw an offer if your circumstances change materially (new credit, lost job) or if the property's valuation falls. Don't make major financial moves between offer and completion.",
      },
    ],
  },
  {
    id: 5,
    slug: "instruct-a-solicitor-uk",
    title: "Kick-start the legal process",
    guideTitle: "Choosing a conveyancing solicitor in the UK — fees, panels, and timing",
    metaDescription:
      "How UK conveyancing works, what solicitors actually do, typical fixed fees, and how to pick one who's fast, communicative, and on your lender's panel.",
    blurb: "Instruct a solicitor or conveyancer to handle the legal side.",
    timescale: "Runs 8–12 weeks alongside stages 4–7",
    cost: "£1,000–£2,500 including disbursements",
    whatHappens:
      "Your solicitor (or licensed conveyancer) handles searches, contracts, the title, and the actual transfer of money on completion day.",
    watchOutFor: [
      "Using one not on your lender's panel — extra fees if you do.",
      "The cheapest quote rarely the fastest service.",
      "Solicitor delays — chase weekly, escalate to a senior partner if needed.",
    ],
    actions: [
      "Compare three solicitors on your lender's panel.",
      "Send ID and proof of address for AML.",
      "Fill in the property information forms the solicitor sends.",
    ],
    needs: ["solicitor"],
    faqs: [
      {
        q: "What does a conveyancing solicitor do?",
        a: "They handle the legal transfer of property — drafting and reviewing contracts, running local authority searches, checking the title, and managing the actual money transfer at exchange and completion.",
      },
      {
        q: "How much does conveyancing cost in the UK?",
        a: "Expect £1,000–£2,500 all-in for a typical purchase. Higher in London and for leasehold properties; lower for straightforward freehold purchases outside major cities.",
      },
      {
        q: "Should I use my mortgage lender's panel solicitor?",
        a: "Your solicitor must be on your lender's panel — if they aren't, the lender appoints its own one and you pay both. Always confirm panel status before instructing.",
      },
    ],
  },
  {
    id: 6,
    slug: "property-survey-uk",
    title: "Sort a property survey",
    guideTitle: "Property surveys in the UK — Level 2 vs Level 3 and what they cost",
    metaDescription:
      "What a HomeBuyer Report (Level 2) and Full Structural Survey (Level 3) actually check, when to choose each, and how to use the findings to renegotiate.",
    blurb: "Independent check of the property's condition.",
    timescale: "Two to four weeks",
    cost: "£400 (snagging) to £1,500 (Level 3 full structural)",
    whatHappens:
      "A qualified surveyor inspects the property. Level 2 (HomeBuyer) for under-50-year-old homes. Level 3 (full structural) for older or unusual properties.",
    watchOutFor: [
      "Confusing the lender's valuation with a real survey — it isn't one.",
      "Skipping a survey on an old home to save money.",
      "Not using survey findings to renegotiate the price.",
    ],
    actions: [
      "Pick Level 2 or Level 3 based on age and condition.",
      "Book before mortgage offer expires.",
      "If issues are flagged, get repair quotes and go back to the seller.",
    ],
    needs: ["surveyor"],
    faqs: [
      {
        q: "Is the lender's valuation a survey?",
        a: "No. The lender's valuation is a basic check that the property exists and is worth roughly what you're paying. It's for the lender, not you. A proper survey is a separate commission you arrange yourself.",
      },
      {
        q: "What's the difference between a Level 2 and Level 3 survey?",
        a: "Level 2 (HomeBuyer Report) is suitable for conventional homes under 50 years old and costs £500–£1,000. Level 3 (Full Structural / Building Survey) is needed for older, listed, or unusual properties and costs up to £1,500 but is far more detailed.",
      },
      {
        q: "Can I renegotiate after a bad survey?",
        a: "Yes — and you should if there are material findings. Get a builder's quote for the repairs, share it with the seller via the estate agent, and ask for the cost to be knocked off the agreed price.",
      },
    ],
  },
  {
    id: 7,
    slug: "buildings-insurance-uk",
    title: "Arrange buildings insurance",
    guideTitle: "Buildings insurance for UK buyers — when to start cover and what it costs",
    metaDescription:
      "Why your buildings insurance must start on exchange day (not completion), how to set the right rebuild value, and what the typical UK premiums look like.",
    blurb: "Set up cover from the moment of exchange — not completion.",
    timescale: "Up to a week",
    cost: "Typically £150–£500/year",
    whatHappens:
      "You take out buildings insurance with a start date that aligns with exchange of contracts — when you legally take on the risk.",
    watchOutFor: [
      "Setting the start date to completion rather than exchange.",
      "Insuring for the purchase price instead of the rebuild value.",
      "Auto-renewing year after year without checking the market.",
    ],
    actions: [
      "Compare 3 quotes (e.g. MoneySupermarket, Compare the Market).",
      "Use the rebuild value from the lender's valuation, not the purchase price.",
      "Set the policy start date to your expected exchange date.",
    ],
    needs: [],
    faqs: [
      {
        q: "When does buildings insurance need to start?",
        a: "On the day you exchange contracts, not the day you complete. From exchange you're legally bound to buy, so if the property burns down between exchange and completion, you still have to buy it — and insurance is what protects you from that risk.",
      },
      {
        q: "Should I insure for the purchase price?",
        a: "No — insure for the rebuild value, which the lender's surveyor estimates. The rebuild value is often less than the market price (because it doesn't include the land), but in some cases (e.g. period properties) can be more.",
      },
    ],
  },
  {
    id: 8,
    slug: "exchange-contracts-uk",
    title: "Get ready to exchange contracts",
    guideTitle: "Exchanging contracts on a UK property — the final checks",
    metaDescription:
      "What happens at exchange of contracts, what your deposit covers, how the completion date is set, and what to do if a chain wobbles in the final week.",
    blurb: "Final checks, sign the contract, send the deposit.",
    timescale: "Two to three weeks",
    cost: "10% deposit (often less if your overall deposit is smaller)",
    whatHappens:
      "Solicitor goes through search results and enquiries. You agree a completion date, sign the contract, and send the deposit. Then solicitors swap signed copies — legally binding.",
    watchOutFor: [
      "Buildings insurance not active from exchange day.",
      "Chain wobbles in the final week.",
      "Forgetting completion date is now contractually fixed.",
    ],
    actions: [
      "Negotiate a completion date that works for the whole chain.",
      "Arrange CHAPS payment to your solicitor (banks limit normal transfers).",
      "Sign and return the contract — your solicitor will brief you.",
    ],
    needs: ["solicitor"],
    faqs: [
      {
        q: "What happens if I pull out after exchange?",
        a: "You lose your 10% deposit and can be sued for further damages by the seller. After exchange the contract is legally binding — only pull out for the most serious reasons and with legal advice.",
      },
      {
        q: "How long between exchange and completion?",
        a: "Usually one to four weeks. Most chains aim for a Friday completion. The gap can be same-day (called 'simultaneous exchange and completion') in rare cases.",
      },
    ],
  },
  {
    id: 9,
    slug: "completion-day-uk",
    title: "Prepare for completion and move in",
    guideTitle: "Completion day in the UK — what happens and how to prepare",
    metaDescription:
      "How completion day works hour by hour, what your solicitor does behind the scenes, and the checklist to take with you when you pick up the keys.",
    blurb: "Final paperwork, money moves, keys handed over.",
    timescale: "Two to five weeks (exchange to completion)",
    cost: "Final balance + removals £400–£1,500",
    whatHappens:
      "Solicitor produces a completion statement. You sign the transfer deed. On the day, mortgage funds are drawn, the seller's solicitor receives the money, and you get the keys (typically around midday).",
    watchOutFor: [
      "Bank transfer cut-off times on completion day.",
      "Missing the final viewing the day before — check fixtures.",
      "Forgetting to take photos of meter readings on move-in day.",
    ],
    actions: [
      "Book removals at least two weeks out.",
      "Pack rooms one at a time, label everything.",
      "On the day: photograph meters, check every key works.",
    ],
    needs: ["solicitor"],
    faqs: [
      {
        q: "What time do you get the keys on completion day?",
        a: "Usually around midday once the funds clear, though it can be earlier or later. The seller's solicitor releases the keys to the estate agent as soon as the money lands in their account.",
      },
      {
        q: "Do I need to be present on completion day?",
        a: "Not necessarily — your solicitor handles the legal paperwork. But you'll want to be there to collect keys, check the property, and oversee the move.",
      },
    ],
  },
  {
    id: 10,
    slug: "stamp-duty-and-land-registry",
    title: "Complete the final steps",
    guideTitle: "Stamp Duty, Land Registry, and changing addresses — finishing the move",
    metaDescription:
      "Stamp Duty rates for first-time buyers in the UK, Land Registry fees, and the address-change checklist for the first two weeks in your new home.",
    blurb: "Stamp Duty, Land Registry, redirect everything.",
    timescale: "Instantly to two weeks",
    cost: "Stamp Duty (varies) + £250–£500 Land Registry fee",
    whatHappens:
      "Solicitor pays your SDLT within 14 days and registers your ownership with HM Land Registry. You change your address with banks, employer, DVLA, GP, and the electoral roll.",
    watchOutFor: [
      "Missing the 14-day SDLT deadline.",
      "Forgetting Royal Mail redirection (~£35 for 6 months).",
      "Discovering a flagged issue from the survey isn't fixed — follow up.",
    ],
    actions: [
      "Confirm the solicitor has paid SDLT.",
      "Update your address with banks, DVLA, GP, electoral roll.",
      "Take meter readings to the new utility providers.",
    ],
    needs: [],
    faqs: [
      {
        q: "Do first-time buyers pay Stamp Duty in the UK?",
        a: "First-time buyers in England and Northern Ireland pay 0% Stamp Duty on the first £425,000 (up to a maximum property price of £625,000). Above that, normal rates apply. Wales and Scotland use Land Transaction Tax and Land and Buildings Transaction Tax respectively.",
      },
      {
        q: "When do I need to pay Stamp Duty?",
        a: "Within 14 days of completion. Your solicitor typically files the return and pays HMRC on your behalf, but the legal responsibility is yours — check it's been done.",
      },
    ],
  },
];

export const ONBOARDING_TO_STAGE_ID: Record<Stage, number> = {
  browsing: 1,
  "offer-placed": 4,
  "sourcing-pros": 5,
  "in-flight": 5,
};

export const STAGE_ID_TO_PHASE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
};

export const PHASE_NAMES = [
  "Get ready",
  "Find your home",
  "Make it official",
  "Get the keys",
];

type Provider = {
  name: string;
  location: string;
  rating: string;
  price: string;
  note: string;
};

export const SAMPLE_PROVIDERS: Record<ServiceType, Provider[]> = {
  "mortgage-broker": [
    {
      name: "Habito",
      location: "Online · UK-wide",
      rating: "4.7★",
      price: "£0 broker fee",
      note: "Whole-of-market, free for the buyer.",
    },
    {
      name: "London & Country",
      location: "Online · UK-wide",
      rating: "4.6★",
      price: "£0 broker fee",
      note: "Fee-free, paid by lenders.",
    },
    {
      name: "Mortgage Advice Bureau",
      location: "350+ UK branches",
      rating: "4.8★",
      price: "£300–£500",
      note: "In-person specialist for complex cases.",
    },
  ],
  solicitor: [
    {
      name: "Aurora Legal",
      location: "London",
      rating: "4.8★",
      price: "£1,150 fixed",
      note: "On all major lender panels.",
    },
    {
      name: "Greenfield & Co.",
      location: "Manchester",
      rating: "4.7★",
      price: "£985 fixed",
      note: "14-day average exchange.",
    },
    {
      name: "Coastline Conveyancing",
      location: "Bristol",
      rating: "4.6★",
      price: "£1,290 fixed",
      note: "Specialists in leasehold.",
    },
  ],
  surveyor: [
    {
      name: "RICS Direct",
      location: "Nationwide",
      rating: "4.8★",
      price: "£550 Level 2",
      note: "Largest RICS-accredited network.",
    },
    {
      name: "SurveyorLocal",
      location: "Nationwide",
      rating: "4.7★",
      price: "£480 Level 2 · £980 Level 3",
      note: "Reports within 5 working days.",
    },
    {
      name: "Hawkeye Surveys",
      location: "South-East England",
      rating: "4.9★",
      price: "£625 Level 2",
      note: "Specialists in period properties.",
    },
  ],
};

export const SERVICE_LABEL: Record<ServiceType, string> = {
  "mortgage-broker": "Mortgage brokers",
  solicitor: "Solicitors",
  surveyor: "Surveyors",
};

export function stageBySlug(slug: string): DashboardStage | undefined {
  return DASHBOARD_STAGES.find((s) => s.slug === slug);
}
