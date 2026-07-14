// Topic guides — deep-dive SEO articles that sit alongside the 10 stage guides.
// Each links back to relevant stage guides to build internal link equity.

export type TopicSection = {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
  /** Stage IDs to surface as "read more" links at the end of this section */
  relatedStageIds?: number[];
};

export type TopicGuide = {
  slug: string;
  guideTitle: string;
  headline: string; // display H1 (can differ from title tag)
  metaDescription: string;
  intro: string;
  sections: TopicSection[];
  faqs: { q: string; a: string }[];
  /** Stage IDs to show in the main "Related guides" section */
  relatedStageIds: number[];
  publishDate: string;
};

export const TOPIC_GUIDES: TopicGuide[] = [
  // ──────────────────────────────────────────────────────────────────────
  // 1. FIRST-TIME BUYER MEGA GUIDE
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "first-time-buyer-guide-uk",
    guideTitle:
      "The complete UK first-time buyer guide (2025) — step by step",
    headline: "The complete UK first-time buyer guide",
    metaDescription:
      "Everything you need to know about buying your first home in the UK. Mortgages, solicitors, surveys, stamp duty — one plain-English guide for 2025.",
    intro:
      "Buying your first home is one of the biggest financial decisions you'll ever make — and one of the most confusing. This guide walks you through the whole UK process in plain English, from getting a mortgage in principle to picking up the keys. You can read it end-to-end or jump to the stage you're at right now.",
    sections: [
      {
        h2: "Step 1 — Work out how much you can borrow",
        paragraphs: [
          "Before you start looking at properties, you need to know your budget. UK lenders typically offer between 4 and 4.5 times your annual salary, though some will go up to 5.5x for higher earners. Your credit score, existing debts (car finance, credit cards), and the deposit you can put down all affect the final number.",
          "The first thing to do is get an Agreement in Principle (AIP) — sometimes called a Decision in Principle. This is a free, soft-credit-check letter from a lender confirming how much they'd provisionally lend you. It normally takes a couple of days and is valid for 30–90 days. Don't go house-hunting without one: serious sellers and their agents want to see it before they consider offers.",
          "The best way to get an AIP is through a whole-of-market mortgage broker. Brokers see deals from across the industry — not just from one bank — and for first-time buyers they're usually free (paid by the lender when you complete).",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "Step 2 — Find your property",
        paragraphs: [
          "Once you know your budget, the search begins. Rightmove has the largest inventory. Zoopla is strong on sold-price history (essential for checking you're not overpaying). OnTheMarket often gets new listings 24 hours before the others. Set up alerts on all three.",
          "View 10–25 properties before you make a serious offer. Go back to anything you're genuinely interested in at a different time of day — a quiet street at 10am can be a different experience at 5pm. Ask every agent why the seller is moving and how long the property has been on the market.",
          "If you're considering a flat, check whether it's leasehold. Most flats in England are. Leasehold means you own the right to occupy for a fixed term, not the building itself, and you'll pay service charges and possibly ground rent to the freeholder. Always ask for a copy of the lease and check how many years are left — anything under 80 years triggers extra mortgage complications.",
        ],
        bullets: [
          "Check EPC rating — F or G will mean expensive heating bills",
          "Look up the flood risk at gov.uk/check-flood-risk",
          "Run the postcode through Ofcom's checker for broadband speeds",
          "Pull recent sold prices from the Land Registry or Rightmove's sold data",
        ],
        relatedStageIds: [2],
      },
      {
        h2: "Step 3 — Make an offer and negotiate",
        paragraphs: [
          "When you find the one, move quickly. Look up recent sold prices in the same street or postcode, decide your walk-away number, and make a written offer with conditions — for example, 'subject to survey' and 'seller to take the property off the market on acceptance'.",
          "A common starting point is 5–10% below asking, but in a competitive market, at or above asking is sometimes needed. The agent's job is to get the best price for the seller — they're not on your side. Always follow up your offer in writing.",
          "Once accepted, the property is marked 'Sold Subject to Contract' (SSTC). Nothing is legally binding yet — either side can still walk away. That changes when you exchange contracts (Stage 8).",
        ],
        relatedStageIds: [3],
      },
      {
        h2: "Step 4 — Get your mortgage and sort the legal work",
        paragraphs: [
          "With an accepted offer, your broker submits the full mortgage application. The lender runs proper income and credit checks, sends a surveyor to value the property, then issues a formal mortgage offer — valid for 3–6 months. This process typically takes 2–8 weeks.",
          "At the same time, you need to instruct a conveyancing solicitor. Your solicitor handles the legal transfer: they run local authority searches, check the title deeds, review the contract, deal with the other side's solicitor, and manage the money at completion. Budget £1,000–£2,500 in total including disbursements.",
          "Always check the solicitor is on your mortgage lender's approved panel before instructing them. If they're not, the lender will appoint their own solicitor and you'll pay for both.",
        ],
        relatedStageIds: [4, 5],
      },
      {
        h2: "Step 5 — Survey, insurance, and the final straight",
        paragraphs: [
          "Get an independent survey. Do not confuse the lender's mortgage valuation with a survey — the valuation is for the bank, not you, and it only confirms the property is roughly worth the price. A proper survey tells you what's actually wrong with the building.",
          "For most properties under 50 years old, a Level 2 HomeBuyer Report (£500–£900) is sufficient. For older, unusual, or obviously tired buildings, a Level 3 Full Structural Survey (£900–£1,500) is worth every penny. If the survey flags significant issues, use the findings to renegotiate the price.",
          "Before exchange, you must have buildings insurance in place with a start date of exchange day — not completion day. From exchange you're legally obligated to complete the purchase, so if the property burns down between exchange and completion, you need to be covered.",
        ],
        relatedStageIds: [6, 7],
      },
      {
        h2: "Step 6 — Exchange and completion",
        paragraphs: [
          "Exchange of contracts is the point of no return. Your solicitor and the seller's solicitor swap signed copies of the contract. You send your deposit (typically 10%). The completion date is legally fixed. From this point, if you pull out you lose your deposit and can be sued for further losses.",
          "Completion day is when the money moves and the keys change hands. Your mortgage lender sends the funds to your solicitor, who forwards them to the seller's solicitor. The moment they confirm receipt, the estate agent releases the keys — typically around midday on a Friday.",
          "After completion, your solicitor pays your Stamp Duty Land Tax (SDLT) within 14 days and registers your ownership with HM Land Registry. First-time buyers pay 0% SDLT on the first £425,000 (for properties up to £625,000).",
        ],
        relatedStageIds: [8, 9, 10],
      },
    ],
    faqs: [
      {
        q: "How long does it take to buy a house in the UK?",
        a: "From having an offer accepted to getting the keys, the UK average is 12–16 weeks (three to four months). Getting a mortgage in principle and finding the property can add several more months on top. A chain-free purchase with an organised buyer and seller can complete in 8 weeks.",
      },
      {
        q: "How much deposit do I need to buy a house in the UK?",
        a: "Minimum 5% of the property price for most mortgages. A 10% deposit gets you better rates. 20%+ gets you the best rates and the most choice. On a £300,000 home, 5% is £15,000 and 10% is £30,000.",
      },
      {
        q: "Do first-time buyers get any discounts or help in the UK?",
        a: "Yes. First-time buyers pay 0% Stamp Duty on the first £425,000 (for properties up to £625,000). The Lifetime ISA gives a 25% government bonus (up to £1,000 a year) on savings used towards a first home. The Mortgage Guarantee Scheme allows some lenders to offer 95% mortgages.",
      },
      {
        q: "Can I buy a house in the UK without a solicitor?",
        a: "Technically yes, but your mortgage lender will require legal representation for their interests, so someone has to do the legal work. In practice it's always done by a solicitor or licensed conveyancer. It would be extremely risky to do your own conveyancing.",
      },
      {
        q: "What is a chain in UK property buying?",
        a: "A chain is a sequence of linked purchases — for example, you're buying from someone who is buying from someone else, who is also waiting on a sale. All transactions in the chain have to complete on the same day. Chains can and do collapse, which is why chain-free purchases are valued by buyers.",
      },
      {
        q: "What is the difference between exchange and completion?",
        a: "Exchange is when solicitors swap signed contracts and the deposit is paid — the deal is now legally binding. Completion is typically a week to four weeks later, when the remaining money moves and you collect the keys. Exchange locks in the deal; completion hands over the property.",
      },
    ],
    relatedStageIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    publishDate: "2025-01-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 2. COST OF BUYING A HOUSE
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "cost-of-buying-a-house-uk",
    guideTitle:
      "How much does it cost to buy a house in the UK? (2025 guide)",
    headline: "How much does it cost to buy a house in the UK?",
    metaDescription:
      "A complete breakdown of the costs involved in buying a home in the UK — mortgage fees, conveyancing, surveys, Stamp Duty, and moving costs for 2025.",
    intro:
      "The headline price of a property is only part of what you'll pay. On a typical UK first-time purchase, the fees, taxes, and professional costs add between 2% and 5% to your total spend. This guide breaks every cost down so there are no surprises on the day.",
    sections: [
      {
        h2: "Upfront costs before you even make an offer",
        paragraphs: [
          "Getting an Agreement in Principle from a lender is free. A whole-of-market mortgage broker is also typically free for first-time buyers — they're paid a procuration fee by the lender when your mortgage completes. However, some specialist brokers charge a fee (usually £300–£500) for complex cases.",
          "When you register to view properties, estate agents will ask for proof of finances. There are no fees for viewings. However, once your offer is accepted, the estate agent will run anti-money-laundering (AML) identity checks — typically £20–£60 per buyer.",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "Mortgage costs",
        paragraphs: [
          "Many mortgages come with an arrangement fee — typically £999–£1,999. This can usually be added to the mortgage itself rather than paid upfront, though you'll then pay interest on it over the full term. Compare the total cost of the loan, not just the headline rate.",
          "There is sometimes also a booking fee (£100–£250) charged to reserve the rate while your application is processed. Not all lenders charge this. Your broker should show you the overall cost comparison — the Annual Percentage Rate of Charge (APRC) — for each product.",
          "The lender will also instruct a mortgage valuation surveyor to confirm the property is worth what you're paying. This can cost £150–£500 but is sometimes free with certain products. This is not the same as a structural survey.",
        ],
        relatedStageIds: [4],
      },
      {
        h2: "Conveyancing fees",
        paragraphs: [
          "Conveyancing is the legal transfer of property ownership. You'll need to appoint a solicitor or licensed conveyancer. For a standard first-time purchase, expect a total bill of £1,000–£2,500, which includes the solicitor's professional fee and a set of disbursements (searches, Land Registry fee, bank transfer charges).",
          "Local authority searches alone typically run £150–£350 depending on the council. The Land Registry registration fee is charged on a sliding scale: on a £300,000 purchase it's around £330. Budget these separately from the solicitor's headline quote.",
        ],
        bullets: [
          "Solicitor professional fee: £800–£1,500",
          "Local authority search: £150–£350",
          "Land Registry fee: £45–£910 (based on price)",
          "Drainage and water search: £30–£80",
          "Environmental search: £25–£65",
          "Bank transfer (CHAPS) fee: £25–£50",
        ],
        relatedStageIds: [5],
      },
      {
        h2: "Survey costs",
        paragraphs: [
          "Don't skip the survey. A Level 2 HomeBuyer Report (RICS) typically costs £500–£900 and is suitable for most conventional homes built after 1930. A Level 3 Full Structural Survey runs £900–£1,500 and is worth the extra for older, extended, or obviously tired properties.",
          "If the survey reveals problems — say, a failing roof or damp — you can use the findings to renegotiate the asking price. A £700 survey that saves you £5,000 in a price reduction is excellent value.",
        ],
        relatedStageIds: [6],
      },
      {
        h2: "Stamp Duty Land Tax (SDLT)",
        paragraphs: [
          "Stamp Duty is often the single biggest upfront cost after the deposit. In England and Northern Ireland, first-time buyers pay 0% on the first £425,000 of the purchase price, provided the property costs no more than £625,000. Above that threshold, standard rates apply.",
          "On a £300,000 property, a first-time buyer pays £0 SDLT. On a £500,000 property, they pay £3,750 (5% on the £75,000 above the £425,000 threshold). Wales uses Land Transaction Tax; Scotland uses Land and Buildings Transaction Tax — different rates apply in both.",
        ],
        relatedStageIds: [10],
      },
      {
        h2: "Moving and miscellaneous costs",
        paragraphs: [
          "Removals firms typically charge £400–£1,500 for a house move depending on the volume and distance. Man-and-van services are cheaper for small flats. Booking well in advance (4–6 weeks) gets better availability and sometimes a lower price.",
          "Additional costs to factor in: Royal Mail redirection (around £35 for 3 months), any immediate maintenance or decorating, new appliances if white goods aren't included, and window cleaning or locksmith costs on day one.",
        ],
        bullets: [
          "Removals: £400–£1,500",
          "Buildings insurance (mandatory from exchange): ~£150–£500/year",
          "Royal Mail redirection: £35 for 3 months",
          "New locks: £80–£200 (recommended)",
          "Deep clean: £150–£400 if the property is left dirty",
        ],
        relatedStageIds: [7, 9],
      },
      {
        h2: "Total cost summary",
        paragraphs: [
          "On a £300,000 first-time purchase with a 10% (£30,000) deposit, you should budget approximately £5,000–£8,000 in additional costs on top of the deposit: roughly £1,500 for conveyancing, £700 for a Level 2 survey, £1,000–£1,999 for a mortgage arrangement fee, £0 Stamp Duty (under the threshold), and £500–£1,000 for moving and miscellaneous.",
          "On a £500,000 property the picture changes: Stamp Duty adds £3,750, conveyancing can run closer to £2,000 (leasehold flats add more), and a more expensive survey may be warranted — expect total additional costs of £8,000–£12,000.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the average cost of buying a house in the UK?",
        a: "On top of your deposit, budget 2–5% of the property price for fees and taxes. On a £300,000 purchase that's roughly £6,000–£15,000 in additional costs (less at lower prices with first-time buyer Stamp Duty relief; more on higher-value or leasehold properties).",
      },
      {
        q: "Can I add mortgage fees to my mortgage?",
        a: "Yes — most arrangement fees can be added to the mortgage balance rather than paid upfront. The downside is you then pay interest on them over the full mortgage term, which can add up to more overall. It's a cashflow vs. total cost trade-off.",
      },
      {
        q: "Are conveyancing fees negotiable?",
        a: "To a limited extent. Comparing three quotes is more effective than negotiating with one. Fixed-fee conveyancers are common and make comparison easy. Be cautious of very cheap quotes — they sometimes hide disbursements or result in slow service.",
      },
      {
        q: "When do I pay Stamp Duty?",
        a: "Within 14 days of completion. Your solicitor typically files the SDLT return and pays HMRC on your behalf — it'll be on your completion statement. Make sure you confirm this has been done; you're legally responsible even if the solicitor handles it.",
      },
      {
        q: "Is a survey compulsory?",
        a: "No — it's not legally required. But skipping one on an older property is a significant risk. The lender's valuation is not a survey and protects only the lender. A proper survey protects you from unexpected repair bills.",
      },
    ],
    relatedStageIds: [1, 4, 5, 6, 7, 10],
    publishDate: "2025-01-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 3. LEASEHOLD VS FREEHOLD
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "leasehold-vs-freehold-uk",
    guideTitle:
      "Leasehold vs freehold in the UK — what buyers need to know (2025)",
    headline: "Leasehold vs freehold: what UK buyers need to know",
    metaDescription:
      "The difference between leasehold and freehold, why it matters when buying a flat or house in the UK, and the key things to check before you make an offer.",
    intro:
      "Leasehold vs freehold is one of the most important distinctions in UK property — and one of the least explained. If you're buying a flat, there's a very high chance it's leasehold. Here's what that means for you, what to watch out for, and what's changing in UK law.",
    sections: [
      {
        h2: "The simple difference",
        paragraphs: [
          "Freehold means you own the property and the land it sits on outright. There are no ongoing charges to a third party and no time limit on your ownership. Most houses in England and Wales are sold freehold.",
          "Leasehold means you own the right to occupy the property for a fixed period — the lease term — which could be anything from 40 years to 999 years. The land and structure is owned by a freeholder (also called a landlord), to whom you may owe ground rent and service charges. When the lease expires, ownership reverts to the freeholder.",
          "In Scotland, leasehold is effectively abolished for residential property — almost everything is sold freehold (or 'ownership' in Scots law). The leasehold issues described here apply primarily to England and Wales.",
        ],
      },
      {
        h2: "Why lease length matters — and when it becomes a problem",
        paragraphs: [
          "A new-build leasehold flat might come with a 999-year lease — essentially the same as freehold for any practical purpose. Problems arise when the lease gets shorter.",
          "Below 80 years, mortgage lenders start to get nervous. Many won't lend at all on leases below 70 years, and those that do often charge a premium. When a lease drops below 80 years, extending it also becomes significantly more expensive because the freeholder can claim a share of the property's 'marriage value'.",
          "When you're buying, always ask how many years are left on the lease. A property with 85 years remaining sounds fine — but 85 years will become 70 years in 15 years' time. You'll likely want to extend the lease before then, and to do so under the Leasehold Reform Act you need to have owned the property for two years first.",
        ],
        relatedStageIds: [2],
      },
      {
        h2: "Ground rent and service charges — the ongoing costs",
        paragraphs: [
          "Service charges are fees you pay to the freeholder (or managing agent) for maintaining the building, communal areas, and sometimes insurance. They can be reasonable (£1,000–£2,000 a year for a well-managed block) or very high (£5,000+ in newer build-to-rent and luxury blocks). Always ask for three years of service charge accounts before committing.",
          "Ground rent is a periodic payment to the freeholder for the land. The Leasehold Reform (Ground Rent) Act 2022 abolished ground rent for new leases. But many existing leases, especially those from the 2000s and 2010s, have 'doubling' or RPI-linked ground rent clauses that make the property very difficult to mortgage or sell. Check the ground rent terms carefully.",
        ],
        bullets: [
          "Ask for three years of service charge accounts and budgets",
          "Check whether there are major works planned that haven't been budgeted",
          "Ask if the building has had a recent fire risk assessment",
          "Check the EWS1 form status if it's a high-rise (post-Grenfell cladding checks)",
          "Review the managing agent's reputation — ask current residents",
        ],
      },
      {
        h2: "What your solicitor will check",
        paragraphs: [
          "A good conveyancing solicitor will review the full lease, highlight any problematic clauses (doubling ground rent, short lease, restrictive covenants), report on the service charge history, and advise you on your rights. This is exactly why conveyancing costs more for leasehold properties.",
          "They'll also check whether you're buying a share of freehold — a structure where the flat owners collectively own the freehold company. This is generally preferable to a third-party landlord situation and often makes the property easier to sell.",
        ],
        relatedStageIds: [5],
      },
      {
        h2: "The leasehold reform picture for 2025",
        paragraphs: [
          "The Leasehold and Freehold Reform Act 2024 passed into law in May 2024. Key changes include: the abolition of the two-year qualifying period before you can extend your lease, a cap on ground rent for new leases at a 'peppercorn' (effectively £0), and changes to make it easier and cheaper to extend leases or buy the freehold collectively.",
          "Some provisions are not yet in force and require secondary legislation, so the full benefit is still arriving. The direction of travel is clearly towards making leasehold fairer for buyers — but in the meantime, the checks above remain essential.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I avoid buying a leasehold property?",
        a: "Not necessarily — most flats are leasehold and that's the reality of the market. The key is to check lease length (aim for 90+ years remaining), understand the service charges, and review the ground rent terms carefully with your solicitor before committing.",
      },
      {
        q: "How much does it cost to extend a lease in the UK?",
        a: "It varies significantly with lease length, property value, and ground rent. As a rough guide, extending a lease with 80–85 years remaining on a £300,000 flat might cost £5,000–£15,000 including solicitor and surveyor costs. Below 80 years, costs rise steeply due to marriage value.",
      },
      {
        q: "What is a share of freehold?",
        a: "Share of freehold means the flat owners collectively own the company that holds the freehold. You own your flat's leasehold and a share of the freehold company. This gives you far more control over the building, service charges, and lease extensions — and is generally viewed more favourably by buyers and mortgage lenders.",
      },
      {
        q: "Can you get a mortgage on a leasehold property?",
        a: "Yes, for the most part — provided the lease has sufficient years remaining (typically 85+ to be safe), there are no problematic ground rent clauses, and the property passes the lender's standard checks. Some lenders have additional requirements for high-rise buildings due to fire safety concerns.",
      },
    ],
    relatedStageIds: [2, 5],
    publishDate: "2025-01-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 4. WHAT IS CONVEYANCING
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "what-is-conveyancing-uk",
    guideTitle:
      "What is conveyancing? A UK buyer's plain-English guide (2025)",
    headline: "What is conveyancing? A UK buyer's plain-English guide",
    metaDescription:
      "Conveyancing is the legal process of transferring property ownership. Here's what UK solicitors actually do, how long it takes, and how to choose the right one.",
    intro:
      "Conveyancing is the legal process of transferring ownership of a property from the seller to the buyer. It's handled by a solicitor or licensed conveyancer, runs alongside your mortgage application, and takes 8–16 weeks for a typical purchase. This guide explains what's actually happening behind the scenes — and how to keep things moving.",
    sections: [
      {
        h2: "What a conveyancing solicitor actually does",
        paragraphs: [
          "Your solicitor acts in your interests (and the lender's) throughout the purchase. They receive and review the draft contract from the seller's solicitor, raise any legal questions (called 'enquiries'), commission searches, check the title, and manage the flow of money at completion.",
          "The other side has their own solicitor, and the two firms communicate formally — very little of this happens face to face. The process involves a lot of back-and-forth paperwork and waiting. Most delays in a purchase come from slow solicitors, chains, or search delays — not from any single party being difficult.",
        ],
        relatedStageIds: [5],
      },
      {
        h2: "Searches — what they are and why they matter",
        paragraphs: [
          "Searches are formal enquiries made to various official databases. They check for things that could affect the property that aren't obvious from a physical inspection. Your solicitor orders several, but the most important are:",
          "The local authority search checks for planning permissions, building regulations applications, road schemes, and financial charges registered against the property by the council. It can also reveal whether the property is listed or in a conservation area.",
          "The drainage and water search confirms whether the property is connected to the public sewer and water supply, and whether any drains run through the garden (relevant if you want to build an extension).",
          "The environmental search looks at flood risk, ground contamination, and proximity to industrial sites. If it flags anything, your solicitor will advise on whether a more detailed report is needed.",
          "Searches typically take 1–6 weeks depending on the local authority. Some buyers choose an indemnity insurance policy instead of waiting for searches — acceptable in some chains but generally not advisable if you have time.",
        ],
      },
      {
        h2: "The contract — what you're actually signing",
        paragraphs: [
          "The sale contract sets out the agreed price, the property boundaries, what's included (fixtures and fittings), any covenants (restrictions on what you can do with the property), and the proposed completion date. Your solicitor reviews it and may negotiate changes with the seller's solicitor before recommending you sign.",
          "Before exchange, you'll also receive a Fixtures and Fittings form (TA10) from the seller, which lists what they're taking and what they're leaving. If the listing photos showed a dishwasher but the TA10 says it's excluded, now is the time to negotiate.",
        ],
        relatedStageIds: [8],
      },
      {
        h2: "Exchange and completion — the solicitor's role",
        paragraphs: [
          "Once searches are back, all enquiries are resolved, and you and your mortgage lender have signed the necessary documents, your solicitor will confirm you're ready to exchange. On exchange day, both solicitors confirm verbal agreement by phone, then physically swap signed contracts. Your solicitor holds your deposit (usually 10%) until this point and sends it to the seller's solicitor on exchange.",
          "On completion day, your solicitor 'draws down' the mortgage funds from your lender and, combined with your deposit, sends the full purchase price to the seller's solicitor via CHAPS (same-day bank transfer). Once the seller's solicitor confirms receipt, they notify the estate agent and the keys are released.",
          "After completion, your solicitor pays your Stamp Duty within 14 days and registers your ownership with HM Land Registry. You should receive a copy of the registered title within a few weeks.",
        ],
        relatedStageIds: [9],
      },
      {
        h2: "How to choose a conveyancing solicitor",
        paragraphs: [
          "The first filter is your mortgage lender's approved panel. Your solicitor must be on this list or the lender will appoint their own firm and you'll pay for both. Get three quotes from firms on your lender's panel and compare them on total cost (not just the headline fee), the firm's Google or Trustpilot reviews, and how quickly they respond to your initial enquiry — their speed of response now is a reasonable proxy for how communicative they'll be throughout.",
          "Avoid the cheapest option if the reviews suggest a slow or unresponsive service. In a chain, delays from one solicitor can hold up every transaction — and that's a source of significant stress and sometimes collapsed deals.",
        ],
      },
      {
        h2: "Common delays — and how to manage them",
        paragraphs: [
          "The most common sources of delay are: waiting for local authority searches (especially in busy councils), solicitor workload (some firms are simply overloaded), complex title issues (missing planning permissions, boundary disputes), and chain issues (someone else in the chain falls through or can't proceed).",
          "You can't control everything, but you can: respond to your solicitor's requests within 24 hours, stay on top of your mortgage application, set a target exchange date early (even informally), and escalate politely but persistently if you haven't heard anything for a week.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does conveyancing take in the UK?",
        a: "Typically 8–16 weeks from when you instruct a solicitor to completion. Freehold properties with no chain can be quicker (8–10 weeks); leasehold or complex titles can take longer. The biggest variable is search turnaround times and how organised both sets of solicitors are.",
      },
      {
        q: "What is the difference between a solicitor and a licensed conveyancer?",
        a: "Both can handle property transactions legally. A solicitor is qualified across all areas of law; a licensed conveyancer specialises only in property. Either is suitable for a standard purchase. Some buyers prefer a solicitor if they expect complications; licensed conveyancers are often cheaper.",
      },
      {
        q: "What is 'exchange' in UK property buying?",
        a: "Exchange is when solicitors on both sides swap signed contracts and your deposit is sent to the seller's solicitor. From this point, the transaction is legally binding. If you pull out after exchange, you lose your deposit. If the seller pulls out, they can be sued for damages.",
      },
      {
        q: "Can conveyancing be done online?",
        a: "Yes — most modern conveyancing is conducted online and by email, with physical signatures on key documents. Many buyers never meet their solicitor in person. Online-only conveyancers can be efficient and competitive on price, but check their reviews for communication quality.",
      },
      {
        q: "What happens if my solicitor makes a mistake?",
        a: "All practising solicitors are required to carry professional indemnity insurance. If they make a negligent error that costs you money (for example, missing a defect in the title), you can make a claim against their insurance. Regulated solicitors can also be reported to the Solicitors Regulation Authority (SRA).",
      },
    ],
    relatedStageIds: [5, 8, 9],
    publishDate: "2025-01-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 5. HOW LONG DOES BUYING TAKE
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "how-long-does-buying-a-house-take-uk",
    guideTitle:
      "How long does buying a house take in the UK? (2025 timeline)",
    headline: "How long does buying a house take in the UK?",
    metaDescription:
      "From mortgage in principle to picking up the keys, here's the realistic UK home buying timeline — phase by phase — and what slows things down.",
    intro:
      "The short answer: from having an offer accepted to completion, the UK average is 12–16 weeks. But that's only part of the journey. Adding the time to find a property and secure a mortgage, most first-time buyers are looking at 3–9 months in total. Here's what that timeline looks like stage by stage — and what can stretch it.",
    sections: [
      {
        h2: "Phase 1 — Before you find a property (1–8 weeks)",
        paragraphs: [
          "Getting your finances in order and securing an Agreement in Principle (AIP) typically takes 1–2 weeks. The process involves pulling your credit report, speaking to a mortgage broker, and completing the AIP application. Some lenders can issue an AIP within 24 hours; others take a week.",
          "Finding the right property is the most unpredictable part. Some buyers find their home in a few weeks; others search for a year. The UK average from starting to search to having an offer accepted is 3–6 months.",
        ],
        relatedStageIds: [1, 2],
      },
      {
        h2: "Phase 2 — From offer accepted to exchange (8–14 weeks)",
        paragraphs: [
          "Once your offer is accepted, the clock starts on the legal and mortgage process. These two tracks run in parallel — your solicitor and your mortgage lender are both working simultaneously.",
          "The formal mortgage application typically takes 2–8 weeks from submission to a confirmed written offer. Simple PAYE cases with clean credit can be done in 2–3 weeks. Self-employed, contract workers, or complex income situations routinely take 6–10 weeks.",
          "Conveyancing — the legal work — runs alongside this and usually sets the pace. Local authority searches take 1–6 weeks depending on the council. Once searches are back and all enquiries from both solicitors are resolved, you're ready for exchange. In a chain, everyone has to be ready simultaneously.",
        ],
        relatedStageIds: [3, 4, 5],
      },
      {
        h2: "Phase 3 — Exchange to completion (1–4 weeks)",
        paragraphs: [
          "Most chains aim to complete 1–4 weeks after exchange. A very common pattern is exchanging on a Monday–Wednesday and completing the following Friday — giving time for all parties to arrange removals, notify utility companies, and prepare.",
          "In some circumstances — particularly in a fast-moving market or when a chain has multiple parties who are all ready — 'simultaneous exchange and completion' happens on the same day. This is riskier (you can't be sure everything is ready until the last minute) but can be agreed when all parties consent.",
          "On completion day itself, funds typically clear by midday. Your estate agent will call to confirm when the seller's solicitor has received the money — that's when you get the keys.",
        ],
        relatedStageIds: [8, 9],
      },
      {
        h2: "After completion — the final steps (2 weeks)",
        paragraphs: [
          "The purchase isn't fully wrapped up on the day you get the keys. Your solicitor pays your Stamp Duty within 14 days of completion and then registers your ownership with HM Land Registry. This registration can take several weeks or even months — the Land Registry has faced significant backlogs — but your solicitor lodges a 'priority' notice on exchange to protect your ownership in the meantime.",
          "You'll want to update your address with banks, DVLA, GP, the electoral roll, National Insurance (HMRC), and anyone else who sends you post within the first couple of weeks.",
        ],
        relatedStageIds: [10],
      },
      {
        h2: "What makes purchases take longer",
        paragraphs: [
          "Long chains are the single biggest cause of delay. A chain of five or six properties is not unusual in the UK, and every party has to be ready before any single one can complete. If one person in the chain loses their job, gets cold feet, or has a survey disaster, the whole chain stalls.",
          "Slow local authority searches are a frequent frustration — some councils take 6 weeks or more. Using a specialist search provider can speed this up slightly, but there's no shortcut for the council's own turnaround time.",
          "Mortgage complexity adds time. First-time buyers with straightforward PAYE income are quickest. Self-employed with two years of accounts, applicants with historic credit issues, or buyers using unusual income sources (bonus, commissions, rental income) all take longer to underwrite.",
        ],
        bullets: [
          "Long chain: adds 4–8 weeks on average",
          "Slow local authority searches: adds 2–5 weeks",
          "Complex mortgage case: adds 2–6 weeks",
          "Leasehold complications: adds 2–4 weeks",
          "Title defects or boundary disputes: adds weeks to months",
        ],
        relatedStageIds: [6],
      },
      {
        h2: "How to keep things moving",
        paragraphs: [
          "The buyer can do more than they think to control pace. Respond to your solicitor's requests within 24 hours. Chase your mortgage broker weekly. Set an informal target exchange date from the start and ask all parties if they can commit to it — this creates momentum.",
          "Use the waiting time productively. While searches are running, sort your buildings insurance, book your surveyor, read through the property information forms your solicitor sends, and research removals firms.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the fastest you can legally complete a house purchase in the UK?",
        a: "With a cash buyer, no chain, and a cooperative seller, a purchase can legally complete in as little as a few days — searches can be skipped with indemnity insurance and contracts exchanged and completed simultaneously. In practice, even fast cash purchases usually take 4–6 weeks for searches and legal due diligence.",
      },
      {
        q: "Why does it take so long to buy a house in the UK compared to other countries?",
        a: "The UK has a particularly slow system because transactions are not legally binding until exchange of contracts. In Scotland and most of Europe, the process locks in earlier, which prevents chains collapsing and reduces fall-through rates. England and Wales average 25–30% fall-through rates on agreed sales.",
      },
      {
        q: "Can you speed up local authority searches?",
        a: "To a limited extent. Using an official search provider (rather than the council directly) can sometimes be faster. Personal search companies can retrieve most of the information in a few days, though some lenders don't accept them. If time is critical, an indemnity insurance policy is sometimes used instead — but this approach has risks and not all lenders accept it.",
      },
      {
        q: "How do I know if my purchase is on track?",
        a: "Ask your solicitor for a status update every week and ask specifically: are we waiting on searches, on enquiries, on the mortgage offer, or on the other side? Each has a different solution. If your solicitor hasn't contacted you for two weeks without explanation, escalate to a senior partner.",
      },
    ],
    relatedStageIds: [1, 2, 3, 4, 5, 8, 9, 10],
    publishDate: "2025-01-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 6. STAMP DUTY FOR FIRST-TIME BUYERS
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "stamp-duty-first-time-buyers-uk",
    guideTitle:
      "Stamp Duty for first-time buyers in the UK (2026 rates & relief)",
    headline: "Stamp Duty for first-time buyers, explained",
    metaDescription:
      "How much Stamp Duty will you pay as a UK first-time buyer in 2026? Current SDLT rates, first-time buyer relief up to £500,000, worked examples, and how Scotland and Wales differ.",
    intro:
      "Stamp Duty is often the biggest single tax you'll pay when buying a home — but as a first-time buyer in England or Northern Ireland, you may pay nothing at all. This guide explains the 2026 rates, exactly how first-time buyer relief works, and shows worked examples so you can budget with confidence.",
    sections: [
      {
        h2: "What is Stamp Duty Land Tax?",
        paragraphs: [
          "Stamp Duty Land Tax (SDLT) is a tax you pay when you buy a home or land over a certain price in England and Northern Ireland. It's charged on a sliding scale, so you only pay the higher rate on the portion of the price that falls into each band — not on the whole amount.",
          "Scotland and Wales run their own separate systems (Land and Buildings Transaction Tax in Scotland, Land Transaction Tax in Wales), with different thresholds — so the rules below apply to England and Northern Ireland.",
          "You normally have 14 days from completion to file an SDLT return and pay. In practice your conveyancing solicitor handles this for you and collects the money as part of completion.",
        ],
        relatedStageIds: [9, 10],
      },
      {
        h2: "First-time buyer relief: the 2026 rules",
        paragraphs: [
          "If you and everyone you're buying with are first-time buyers and the home will be your main residence, you get a discount. As of 2026 you pay no SDLT on the first £300,000, and 5% on the portion between £300,001 and £500,000.",
          "There's a cliff edge to watch: if the price is more than £500,000, you can't claim first-time buyer relief at all and you pay the standard rates on the whole purchase instead.",
        ],
        bullets: [
          "£0 to £300,000 — 0% (no Stamp Duty at all)",
          "£300,001 to £500,000 — 5% on that portion",
          "Over £500,000 — no relief; standard rates apply to the full price",
        ],
        relatedStageIds: [1, 3],
      },
      {
        h2: "The standard rates (if you don't qualify)",
        paragraphs: [
          "If you're not a first-time buyer — or the price is above £500,000 — these are the standard single-property rates for 2026. If buying the property means you'll own more than one home, you usually pay a further 5% surcharge on top, and non-UK residents pay an extra 2%.",
        ],
        bullets: [
          "Up to £125,000 — 0%",
          "£125,001 to £250,000 — 2%",
          "£250,001 to £925,000 — 5%",
          "£925,001 to £1.5 million — 10%",
          "Above £1.5 million — 12%",
        ],
      },
      {
        h2: "Worked examples",
        paragraphs: [
          "A first-time buyer purchasing at £295,000 pays £0, because the whole price sits under the £300,000 threshold. A first-time buyer at £400,000 pays 5% on the £100,000 above £300,000 — that's £5,000.",
          "A first-time buyer buying right at £500,000 pays £10,000 (5% on the £200,000 above £300,000). But a first-time buyer at £520,000 loses the relief entirely and pays the standard rates, which work out far higher — a strong reason to be careful negotiating around that £500,000 line.",
          "For comparison, a non-first-time buyer purchasing at £295,000 pays £4,750 under the standard bands.",
        ],
        relatedStageIds: [3],
      },
    ],
    faqs: [
      {
        q: "Who counts as a first-time buyer for Stamp Duty?",
        a: "Someone who has never owned a freehold or leasehold interest in a residential property — anywhere in the world — and who intends to live in the new home as their main residence. If you're buying jointly, every buyer must be a first-time buyer to qualify for the relief.",
      },
      {
        q: "Do I pay Stamp Duty on a £250,000 first home?",
        a: "No. As a first-time buyer you pay nothing up to £300,000, so a £250,000 purchase attracts no SDLT in England or Northern Ireland.",
      },
      {
        q: "When and how do I pay it?",
        a: "An SDLT return must be filed and the tax paid within 14 days of completion. Your solicitor almost always handles the return and collects the amount from you as part of the completion funds, so you rarely deal with HMRC directly.",
      },
      {
        q: "Is Stamp Duty different in Scotland and Wales?",
        a: "Yes. Scotland charges Land and Buildings Transaction Tax (LBTT) and Wales charges Land Transaction Tax (LTT), each with its own bands and first-time buyer treatment. The rates in this guide apply only to England and Northern Ireland.",
      },
    ],
    relatedStageIds: [1, 3, 9, 10],
    publishDate: "2026-07-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 7. THE LIFETIME ISA FOR FIRST-TIME BUYERS
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "lifetime-isa-first-time-buyers-uk",
    guideTitle:
      "The Lifetime ISA for first-time buyers (2026): bonus, limits & rules",
    headline: "The Lifetime ISA for first-time buyers",
    metaDescription:
      "How the Lifetime ISA helps UK first-time buyers: the 25% government bonus, the £4,000 annual limit, the £450,000 property cap, and the withdrawal penalty to avoid.",
    intro:
      "The Lifetime ISA (LISA) is one of the most generous tools a UK first-time buyer has: the government tops up your savings by 25%. But it comes with strict rules — a property price cap, a minimum holding period, and a penalty if you use the money the wrong way. Here's exactly how it works in 2026.",
    sections: [
      {
        h2: "What is a Lifetime ISA?",
        paragraphs: [
          "A Lifetime ISA is a savings or investment account designed to help you buy your first home or save for later life. You can open one between the ages of 18 and 39, and pay in until you're 50.",
          "The headline benefit is a 25% government bonus on what you save — free money towards your deposit, provided you follow the rules below.",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "The bonus and the limits",
        paragraphs: [
          "You can pay in up to £4,000 each tax year, and this counts towards your overall £20,000 ISA allowance for the 2026 to 2027 tax year. The government then adds 25% on top — so the maximum bonus is £1,000 a year.",
          "The bonus is paid monthly, based on what you contributed, and you keep earning it on new contributions right up until your 50th birthday. Over several years of saving the maximum, the bonuses add up to a meaningful chunk of a deposit.",
        ],
        bullets: [
          "Pay in up to £4,000 per tax year",
          "Government adds 25% — up to £1,000 a year",
          "Counts towards your £20,000 annual ISA allowance",
          "Bonus paid monthly, until you turn 50",
        ],
      },
      {
        h2: "Using it to buy your first home",
        paragraphs: [
          "To put your LISA towards a purchase, the home must cost £450,000 or less (the same cap applies anywhere in the UK), you must be buying with a mortgage, and your first LISA payment must have been at least 12 months ago.",
          "The money is sent directly to your conveyancer, not to you. If you're buying with a partner who also has a Lifetime ISA, you can both use your accounts and both bonuses on the same property — a big advantage for couples.",
        ],
        bullets: [
          "Property price must be £450,000 or less",
          "You must buy with a mortgage and live there",
          "The LISA must have been open at least 12 months",
          "Two first-time buyers can combine two LISAs on one home",
        ],
        relatedStageIds: [1, 3],
      },
      {
        h2: "The withdrawal penalty to watch",
        paragraphs: [
          "If you take money out for anything other than a qualifying first home (before age 60, and outside of terminal illness), you pay a 25% government withdrawal charge. Because of how the maths works, that charge claws back the whole bonus plus a small slice of your own savings.",
          "For example, if you save £1,000 and receive a £250 bonus, your balance is £1,250. A 25% withdrawal charge is £312.50, leaving £937.50 — so you'd get back less than you put in. The lesson: only put money you're confident you'll use for a first home (or retirement) into a LISA.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can my partner and I both use a Lifetime ISA on the same house?",
        a: "Yes. If you're both first-time buyers, you can each hold a Lifetime ISA and use both accounts — and both 25% bonuses — towards the same property, as long as it costs £450,000 or less.",
      },
      {
        q: "What's the maximum property price for a Lifetime ISA?",
        a: "£450,000, and that cap is the same across the whole of the UK. If the home costs more than £450,000 you can't use LISA funds without triggering the 25% withdrawal charge.",
      },
      {
        q: "Should I use a Help to Buy ISA or a Lifetime ISA?",
        a: "You can no longer open a Help to Buy ISA — that scheme is closed to new savers. The Lifetime ISA is the current option and has a higher annual limit and bonus, though it has the £450,000 property cap and the withdrawal charge to keep in mind.",
      },
      {
        q: "How long do I have to wait before I can use it?",
        a: "Your Lifetime ISA must have been open for at least 12 months from your first payment before you can use it towards a first home without penalty.",
      },
    ],
    relatedStageIds: [1, 3],
    publishDate: "2026-07-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 8. FIRST-TIME BUYER SCHEMES
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "first-time-buyer-schemes-uk",
    guideTitle:
      "First-time buyer schemes in the UK (2026): Shared Ownership, First Homes & more",
    headline: "First-time buyer schemes in the UK",
    metaDescription:
      "The government schemes that can help you onto the ladder in 2026 — Shared Ownership, the First Homes scheme, the Lifetime ISA — plus what happened to Help to Buy.",
    intro:
      "If a standard mortgage and deposit feel out of reach, several government-backed schemes are designed to help first-time buyers in England buy sooner. Here's how the main options work in 2026, who qualifies, and how they fit together.",
    sections: [
      {
        h2: "Shared Ownership",
        paragraphs: [
          "With Shared Ownership you buy a share of a home — usually between 10% and 75% — and pay rent to a housing association on the share you don't own. You need a mortgage and deposit only on the share you're buying, so the upfront cost is much lower than buying outright.",
          "Over time you can buy further shares (called 'staircasing'), often all the way up to 100%. It's generally available to households earning £80,000 a year or less (£90,000 in London), and the home is held on a leasehold basis.",
        ],
        bullets: [
          "Buy a 10%–75% share, rent the rest",
          "Staircase up to 100% over time",
          "Household income cap: £80,000 (£90,000 in London)",
        ],
        relatedStageIds: [1, 5],
      },
      {
        h2: "The First Homes scheme",
        paragraphs: [
          "The First Homes scheme offers selected new-build properties to first-time buyers at a discount of at least 30% off the market price — and that discount stays with the home when it's sold on, so future first-time buyers benefit too.",
          "To be eligible you must be a first-time buyer, your household income must be £80,000 or less (£90,000 in London), and your mortgage must cover at least half of the discounted price. After the discount, the home must cost £250,000 or less (£420,000 in London). Local councils can prioritise people with a connection to the area or key workers.",
        ],
        bullets: [
          "At least 30% off the market price, kept for future buyers",
          "Mortgage must cover 50%+ of the discounted price",
          "Post-discount price cap: £250,000 (£420,000 in London)",
        ],
        relatedStageIds: [1, 2],
      },
      {
        h2: "The Lifetime ISA",
        paragraphs: [
          "Not a way to buy, but a powerful way to save: the Lifetime ISA adds a 25% government bonus (up to £1,000 a year) to money you put towards a first home worth £450,000 or less. It pairs well with the schemes above — you can use LISA savings for the deposit on a Shared Ownership or First Homes purchase.",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "What happened to Help to Buy?",
        paragraphs: [
          "The Help to Buy equity loan scheme has closed to new applicants, and you can no longer open a Help to Buy ISA. If you already hold a Help to Buy ISA you can keep saving into it, but new savers should look at the Lifetime ISA instead.",
          "Separately, many lenders offer 95% mortgages, meaning you can buy with a 5% deposit without any specific scheme — worth comparing alongside the options above with a whole-of-market broker.",
        ],
        relatedStageIds: [1],
      },
    ],
    faqs: [
      {
        q: "Can I combine first-time buyer schemes?",
        a: "Often, yes. For example, you can use Lifetime ISA savings (including the 25% bonus) towards the deposit on a Shared Ownership or First Homes purchase. You can't use a LISA if the property costs more than £450,000, though.",
      },
      {
        q: "Do I pay Stamp Duty on a Shared Ownership home?",
        a: "It depends on the value and how you choose to be taxed — you can either pay Stamp Duty on the full market value upfront or in stages as you staircase. It's worth getting your solicitor's advice, and reading our Stamp Duty guide for first-time buyer relief.",
      },
      {
        q: "Is Help to Buy still available?",
        a: "The Help to Buy equity loan has ended and the Help to Buy ISA is closed to new savers. The Lifetime ISA is the main savings scheme available to new first-time buyers today.",
      },
      {
        q: "What are the income limits for Shared Ownership?",
        a: "Generally your household must earn £80,000 a year or less, rising to £90,000 in London. Individual housing associations may apply further local eligibility criteria.",
      },
    ],
    relatedStageIds: [1, 2, 5],
    publishDate: "2026-07-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 9. HOUSE SURVEY TYPES & COSTS
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "house-survey-types-cost-uk",
    guideTitle: "House survey types and costs (2026): Level 1, 2 or 3?",
    headline: "House surveys explained: which type do you actually need?",
    metaDescription:
      "RICS Level 1, 2 and 3 house surveys explained for UK buyers — what each one covers, what they cost in 2026, and how to choose the right survey for your home.",
    intro:
      "A house survey is your one chance to find out what is really wrong with a property before you are legally committed to buying it. Yet many first-time buyers skip it, confuse it with the lender's valuation, or pick the wrong level. This guide explains the three RICS survey levels in plain English, what each costs in 2026, and how to use the findings to protect yourself — and sometimes knock money off the price.",
    sections: [
      {
        h2: "A survey is not the same as a mortgage valuation",
        paragraphs: [
          "This is the single most important thing to understand, and it catches out a huge number of buyers. When you take out a mortgage, your lender carries out a valuation. That valuation exists only to reassure the bank that the property is worth roughly what you are paying, so they can be confident of getting their money back if you default. It is often done as a quick drive-by or desktop check, and you may never even see the full report.",
          "A valuation tells you almost nothing about the condition of the building. It will not warn you about damp, a failing roof, dodgy wiring, subsidence, or knackered windows. Only a proper survey — commissioned by you, working for you — does that. Paying a few hundred pounds now can save you tens of thousands in repairs you did not know were coming.",
          "You arrange and pay for your own survey after your offer is accepted, usually while your solicitor is doing the legal work and before you exchange contracts. That timing matters: a survey after exchange is worthless, because by then you are already committed.",
        ],
        relatedStageIds: [4, 6],
      },
      {
        h2: "The three RICS survey levels",
        paragraphs: [
          "In England, Wales and Northern Ireland, surveys follow the standard set by the Royal Institution of Chartered Surveyors (RICS), which grades them from Level 1 to Level 3. In Scotland the system is different — most sales include a Home Report prepared by the seller, which contains a single survey and valuation, so Scottish buyers rarely need to commission their own.",
          "Choosing the right level comes down to the age, type and condition of the property. Newer and conventional homes need less scrutiny; older, altered or unusual buildings need more.",
        ],
        bullets: [
          "Level 1 (Condition Report): a basic visual check that flags urgent defects and risks using a simple traffic-light system. Best for new-build or modern, conventional homes in good order. It offers no advice on repairs and no valuation.",
          "Level 2 (HomeBuyer Report): the most popular choice. A more detailed inspection of everything visible and accessible, with advice on defects and future maintenance. Available with or without a valuation. Suited to conventional properties in reasonable condition, roughly under 50 years old.",
          "Level 3 (Building Survey): the most thorough option. An in-depth analysis of the structure with detailed advice on defects, likely causes and repair options. Worth it for older properties, listed buildings, anything with obvious problems, or homes that have been heavily extended or altered.",
        ],
        relatedStageIds: [6],
      },
      {
        h2: "How much does a house survey cost in 2026?",
        paragraphs: [
          "Prices vary by property value, size and region, but the 2026 averages give you a useful benchmark. As a rule, the more expensive and complex the property, the more the survey costs — and the more a good one is worth.",
          "Do not choose on price alone. A cheap Level 1 on a Victorian terrace could miss serious structural problems, and the difference in cost between levels is trivial next to the cost of the repairs a survey can uncover.",
        ],
        bullets: [
          "Level 1 Condition Report: around £380 on average, starting from a few hundred pounds.",
          "Level 2 HomeBuyer Report: roughly £465–£685, averaging about £500.",
          "Level 3 Building Survey: typically £575–£900 on average, and £1,000–£1,500+ for larger or higher-value homes.",
          "Always use a surveyor who is RICS-registered, and get the quote confirmed in writing before you instruct.",
        ],
        relatedStageIds: [6],
      },
      {
        h2: "What to do with the findings",
        paragraphs: [
          "A survey is only useful if you act on it. Read the whole report, not just the summary, and pay attention to anything rated as urgent or requiring further investigation. If the surveyor recommends a specialist follow-up — for example a damp and timber report, an electrical check, or a structural engineer for cracking — it is usually worth paying for it before you commit.",
          "If the survey uncovers significant problems, you have three options: ask the seller to fix them before completion, renegotiate the price to reflect the cost of the work, or walk away. Get a builder's quote for the repairs first so your request is backed by a real number rather than guesswork. Because nothing is legally binding until exchange, you have genuine leverage at this stage — sellers often prefer to drop the price rather than lose the sale and start again.",
          "If the report comes back clean, you have bought peace of mind and a maintenance to-do list for the years ahead. Either way, the survey has done its job.",
        ],
        relatedStageIds: [3, 6],
      },
    ],
    faqs: [
      {
        q: "Is a house survey a legal requirement in the UK?",
        a: "No. A survey is optional and is for your benefit, not the lender's. The only assessment the lender insists on is its own mortgage valuation, which does not tell you about the building's condition. Skipping a survey to save money is one of the biggest false economies in home buying.",
      },
      {
        q: "Do I need a Level 2 or a Level 3 survey?",
        a: "For a conventional home under about 50 years old and in reasonable condition, a Level 2 HomeBuyer Report is usually enough. Choose a Level 3 Building Survey for older, listed, unusual or visibly tired properties, or anything that has been significantly extended or altered.",
      },
      {
        q: "Can I use a survey to renegotiate the price?",
        a: "Yes, and buyers do this all the time. If the survey flags costly problems, get a builder's quote for the work and ask the seller to either fix the issues or reduce the price accordingly. As nothing is binding until exchange of contracts, you can renegotiate or withdraw without penalty.",
      },
      {
        q: "When should I book my survey?",
        a: "After your offer is accepted and once you are reasonably confident the purchase will proceed — typically alongside the legal work and always before you exchange contracts. Booking too early risks wasting money if the sale falls through; booking after exchange is pointless because you are already committed.",
      },
    ],
    relatedStageIds: [3, 4, 6],
    publishDate: "2026-07-01",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 10. GIFTED DEPOSITS
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "gifted-deposit-mortgage-uk",
    guideTitle: "Gifted deposits explained: UK mortgage rules (2026)",
    headline: "Gifted deposits: how to use family money for your deposit",
    metaDescription:
      "How gifted deposits work for a UK mortgage in 2026 — the gift letter lenders require, who can gift, the 30-day fund seasoning rule, and the inheritance tax angle.",
    intro:
      "A gifted deposit is money given to you — usually by a parent or grandparent — to put towards your home, with no expectation of repayment and no stake in the property. UK lenders accept gifted deposits for almost all first-time buyer mortgages, but they will require a signed gift letter confirming the money is a genuine gift and not a loan. Get the paperwork right and it is one of the simplest ways onto the ladder.",
    sections: [
      {
        h2: "What counts as a gifted deposit?",
        paragraphs: [
          "A gifted deposit is a sum given to you to use towards your deposit where the giver keeps no legal interest in the property and expects nothing back. That last part is what matters to a lender: if the money has to be repaid, it is a loan, and a loan changes your affordability and can sink the mortgage application.",
          "Gifted deposits are fully compatible with first-time buyer mortgages and with first-time buyer Stamp Duty relief — receiving one does not affect your first-time buyer status. The gift can cover your whole deposit or just top up your own savings; both are normal.",
        ],
        bullets: [
          "The money is a genuine gift, not a loan or an advance",
          "The giver retains no share of or claim on the property",
          "It works alongside first-time buyer Stamp Duty relief",
          "It can be your entire deposit or a top-up to your savings",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "Who can gift a deposit?",
        paragraphs: [
          "Almost every lender accepts gifts from immediate family — parents, grandparents, and often siblings, and a spouse or civil partner. Beyond that it gets patchier: some lenders accept aunts, uncles, and cousins, while gifts from friends or an unrelated third party are accepted by only a minority. If your gift is coming from outside the immediate family, tell your broker up front so they can place you with a lender that allows it.",
          "There is no cap on how much can be gifted for mortgage purposes — you could receive 100% of the deposit as a gift. The lender's concern is not the amount but the proof: they need to see who the money came from, that they could afford to give it, and that it is genuinely a gift.",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "What is a gifted deposit letter, and what must it say?",
        paragraphs: [
          "The gifted deposit letter is a short document, signed by whoever is giving the money, that every lender will ask for. Its job is to prove the money is an unconditional gift. The single most important line is that the money is a 'gift' — if the wording implies a 'loan', 'advance', or any repayment, the lender treats it as a debt and factors it into affordability.",
          "Your solicitor or broker can supply a template, but the letter should confirm the key facts below. The giver will usually also need to provide proof of identity and bank statements showing where the money came from, as part of anti-money-laundering checks.",
        ],
        bullets: [
          "The giver's name and their relationship to you",
          "Your name and the property being purchased",
          "The exact amount being gifted",
          "A clear statement that it is a gift with no repayment expected",
          "Confirmation the giver retains no legal interest in the property",
          "That the giver is solvent and gifting from their own funds",
        ],
        relatedStageIds: [1, 5],
      },
      {
        h2: "How early should the money be in your account?",
        paragraphs: [
          "Ideally, get the gifted funds into your own account at least 30 days before you apply, and 90 days is better. Lenders like to see the deposit 'seasoned' — sitting on your bank statements for a while — because it makes the source easy to verify and reassures them the money is not a last-minute loan.",
          "Money arriving the week before completion is not fatal, but it invites extra questions and can slow things down while your solicitor and lender trace the source of funds. If a gift is on the way, move it early and keep every statement and transfer record.",
        ],
        relatedStageIds: [1, 5],
      },
      {
        h2: "Are there tax implications for a gifted deposit?",
        paragraphs: [
          "There is no tax to pay on the gift itself. A cash gift from one UK individual to another is not income for you and creates no capital gains for the giver, so neither of you owes tax simply for making or receiving it.",
          "The one thing to be aware of is inheritance tax (IHT). Under the '7 year rule', if the giver dies within seven years of making the gift, it can be counted as part of their estate. In practice most deposit gifts fall well within the giver's £325,000 nil-rate band, so no IHT arises. Everyone can also give away £3,000 a year under the annual exemption without it counting at all, and gifts made three to seven years before death benefit from taper relief on any tax due. This is general information, not tax advice — for larger gifts it is worth speaking to a financial adviser.",
        ],
        bullets: [
          "No income tax or capital gains tax on the gift itself",
          "£3,000 annual gift exemption per giver (can carry forward one year)",
          "7 year rule: the gift can count for IHT if the giver dies within 7 years",
          "Taper relief reduces any IHT on gifts made 3–7 years before death",
        ],
        relatedStageIds: [10],
      },
    ],
    faqs: [
      {
        q: "Does a gifted deposit affect my first-time buyer status?",
        a: "No. Receiving a gifted deposit does not change whether you count as a first-time buyer. As long as you have never owned a property, you keep first-time buyer status and the Stamp Duty relief that comes with it, even if a family member funds your whole deposit.",
      },
      {
        q: "Can my parents gift me a deposit and still live in the house?",
        a: "This gets complicated. If the person gifting also intends to live in or own part of the property, lenders may treat them as a joint owner or occupier rather than a pure giver, which changes the mortgage entirely. A genuine gifted deposit means the giver has no interest in and does not live in the property. Discuss any such arrangement with your broker before applying.",
      },
      {
        q: "How much of my deposit can be gifted?",
        a: "There is no lender limit — you can receive up to 100% of your deposit as a gift. What matters is the paperwork: a signed gift letter, proof of the giver's identity, and evidence of the source of the funds for anti-money-laundering checks.",
      },
      {
        q: "Do I have to pay tax on a gifted house deposit?",
        a: "Not on the gift itself — there is no income tax or capital gains tax for giving or receiving a cash gift between UK individuals. The only consideration is inheritance tax under the 7 year rule if the giver dies within seven years, though most deposit gifts sit within the £325,000 nil-rate band and attract no tax.",
      },
    ],
    relatedStageIds: [1, 5, 10],
    publishDate: "2026-07-03",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 11. FIXED VS TRACKER MORTGAGE
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "fixed-vs-tracker-mortgage-uk",
    guideTitle:
      "Fixed vs tracker mortgage UK (2026): which should you pick?",
    headline: "Fixed vs tracker mortgage: which is right for you?",
    metaDescription:
      "Fixed vs tracker mortgages explained for UK first-time buyers in 2026 — how each works, current rates, early repayment charges, and how to choose with confidence.",
    intro:
      "A fixed-rate mortgage locks your interest rate — and your monthly payment — for a set period, usually two or five years, so it can't change even if the Bank of England moves rates. A tracker follows the Bank of England base rate (3.75% as of July 2026) plus a fixed margin, so your payment falls when the base rate is cut and rises when it goes up. Most UK first-time buyers choose a fix for the budgeting certainty; a tracker can win if you expect rates to fall and value flexibility.",
    sections: [
      {
        h2: "How does a fixed-rate mortgage work?",
        paragraphs: [
          "With a fixed rate, your interest rate is set at the start and stays exactly the same for the length of the deal — typically two or five years, though ten-year fixes exist. Your monthly payment is identical every month for that whole period, which makes budgeting simple and protects you completely if interest rates rise.",
          "The trade-off is flexibility. Fixed deals almost always carry an early repayment charge (ERC) if you want to leave, overpay beyond a set limit (often 10% a year), or move home without porting the mortgage. ERCs commonly run from 1% to 5% of the balance and usually taper down each year. On a £250,000 mortgage a 3% ERC is £7,500, so a fix is a commitment for the full term.",
          "When your fix ends you roll onto the lender's standard variable rate (SVR), which is typically much higher, so you'll normally remortgage onto a new deal a few months before it expires.",
        ],
        bullets: [
          "Rate and monthly payment fixed for 2–5 years (sometimes longer)",
          "Full protection if the base rate rises",
          "Early repayment charge to exit early — often 1%–5% of the balance",
          "Usually lets you overpay up to 10% a year penalty-free",
        ],
        relatedStageIds: [1, 4],
      },
      {
        h2: "How does a tracker mortgage work?",
        paragraphs: [
          "A tracker charges the Bank of England base rate plus a fixed margin set by the lender. If the base rate is 3.75% and your margin is 0.75%, you pay 4.50%. That margin never changes, but the base rate does — the Bank's Monetary Policy Committee reviews it eight times a year, and trackers usually adjust within a month of any change.",
          "This means your payment can go down as well as up. If the base rate is cut by 0.25%, your rate falls to 4.25% on the example above and your monthly payment drops. If it rises, your payment rises with it — there's no cap unless the product specifically has one (a 'collar' or 'cap').",
          "Many trackers have low or no early repayment charges, which is the other big draw: you can often remortgage onto a fix at any point without penalty. Always check the specific product, though, as some trackers do apply an ERC.",
        ],
        bullets: [
          "Rate = Bank of England base rate + a fixed margin",
          "Payment falls if the base rate is cut, rises if it climbs",
          "Often no (or low) early repayment charge — check the product",
          "No budgeting certainty: your payment can change several times a year",
        ],
        relatedStageIds: [1, 4],
      },
      {
        h2: "Which is cheaper right now?",
        paragraphs: [
          "There's no permanent winner — it depends on where rates go. In July 2026, with the base rate held at 3.75% since 18 June and markets expecting it to stay there for the rest of the year, fixed and tracker rates are fairly close. As a benchmark, the best first-time buyer two-year fixes sit around 4.67% at 90% loan-to-value (a 10% deposit) and near 4.4%–4.5% with a 15%–25% deposit; five-year fixes are broadly similar.",
          "A tracker only beats a fix overall if the base rate falls far enough, fast enough, to offset the fact that trackers often start a little higher than the cheapest fixes. If the Bank cuts two or three times over your deal, a low-margin tracker with no exit penalty can work out cheaper — and you keep the freedom to switch to a fix if the outlook changes. If rates stay flat or rise, the certainty of a fix looks smart in hindsight.",
          "Because nobody can reliably predict the base rate, the honest answer is to choose based on your own finances and how much payment uncertainty you can live with — not on a forecast.",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "How to choose: a simple decision framework",
        paragraphs: [
          "Start with your budget. If a rate rise of one or two percentage points would genuinely stretch you, the certainty of a fixed rate is usually worth it — you'll always know exactly what leaves your account. Most first-time buyers are in this position, which is why the large majority pick a fix.",
          "Consider a tracker if you have breathing room in your budget, you think rates are more likely to fall than rise, or you may want to move, overpay heavily, or remortgage soon and don't want to be tied in by an early repayment charge. A tracker's flexibility is most valuable when your plans are uncertain.",
          "Whichever way you lean, a whole-of-market mortgage broker is worth using. They can compare fixed and tracker products across the market, factor in fees (not just the headline rate), and flag any that let you switch from tracker to fixed without penalty — a useful hedge. For first-time buyers, brokers are usually free, paid by the lender on completion.",
        ],
        bullets: [
          "Tight budget or rate rise would hurt? Lean fixed.",
          "Comfortable budget and expect cuts? A tracker may pay off.",
          "Might move or overpay soon? Value a tracker's low exit penalty.",
          "Compare total cost including fees, not just the headline rate.",
        ],
        relatedStageIds: [1, 4],
      },
    ],
    faqs: [
      {
        q: "Is a fixed or tracker mortgage better in 2026?",
        a: "Neither is universally better — it depends on your finances and your view on rates. With the base rate held at 3.75% in mid-2026 and expected to stay there for now, most first-time buyers still choose a fix for the payment certainty. A tracker can be cheaper if the base rate falls during your deal and you value the flexibility to switch, but it exposes you to rises.",
      },
      {
        q: "Can I switch from a tracker to a fixed rate later?",
        a: "Usually yes. Many trackers have no early repayment charge, so you can remortgage onto a fixed deal at any time — handy if rates start rising and you want to lock in. Always check your specific product first, as a minority of trackers do apply an exit charge.",
      },
      {
        q: "What happens to a fixed rate when the deal ends?",
        a: "You roll onto the lender's standard variable rate (SVR), which is typically much higher than your fixed rate. To avoid this, start looking to remortgage roughly three to six months before your fix ends so a new deal is ready to begin the moment the old one expires.",
      },
      {
        q: "Does a tracker follow my lender or the Bank of England?",
        a: "A true tracker follows the Bank of England base rate plus a fixed margin, so changes are driven by the Monetary Policy Committee, not your lender's discretion. That's different from a discounted variable or SVR, where the lender sets and changes the rate itself and doesn't have to pass on base rate cuts in full.",
      },
    ],
    relatedStageIds: [1, 4],
    publishDate: "2026-07-07",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 12. HOW TO IMPROVE YOUR MORTGAGE APPROVAL ODDS
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "improve-mortgage-approval-odds-uk",
    guideTitle:
      "How to improve your mortgage approval odds (UK, 2026)",
    headline: "How to improve your chances of getting a mortgage approved",
    metaDescription:
      "A practical UK guide for first-time buyers: the steps that actually improve your mortgage approval odds, from your credit file to your deposit and bank statements.",
    intro:
      "To improve your mortgage approval odds in the UK, focus on the three things lenders check hardest: a clean, up-to-date credit file, provable and stable income, and affordable spending in the three to six months before you apply. Register on the electoral roll, avoid taking on new credit, keep your bank statements tidy, and use a whole-of-market broker to match you to a lender whose rules fit your situation. Most people can see a meaningful difference within three to six months.",
    sections: [
      {
        h2: "What do UK lenders actually check?",
        paragraphs: [
          "There is no single national credit score that decides your mortgage. Each lender builds its own risk picture from your credit file, your income, your deposit, the property itself, and how the application is put together. Affordability usually carries more weight than a headline score — lenders care most about whether you can sustainably keep up the repayments.",
          "Affordability in the UK sits in layers. The Bank of England's Financial Policy Committee sets a loan-to-income flow limit that caps lending at 4.5 times income or above to 15% of each lender's new mortgages in a quarter. The Financial Conduct Authority sets the conduct rules, including a forward-looking stress test that checks you could still pay if rates rose. In 2026, after the FCA reaffirmed flexibility in those rules, several major lenders now offer up to 5.5 times income as standard, and some go higher for specific borrower profiles.",
          "The practical takeaway: two lenders can look at the same application and reach different decisions. That is why a rejection from one bank does not mean you cannot get a mortgage — it often means you applied to the wrong lender.",
        ],
        bullets: [
          "Your credit file and repayment history",
          "Provable, stable income (payslips, tax calculations for the self-employed)",
          "Your committed outgoings and recent spending",
          "Deposit size and the resulting loan-to-value",
          "The property type, condition and construction",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "How can I improve my credit file before applying?",
        paragraphs: [
          "Start at least three to six months before you plan to apply — that is roughly how long it takes for positive changes to show and for lenders to see a settled pattern. Check all three UK credit reference agencies (Experian, Equifax and TransUnion), because lenders use different ones and errors on any of them can hold you back.",
          "The single easiest win is getting on the electoral roll at your current address: it confirms your identity and is quick to fix. Beyond that, pay every bill on time, bring credit-card balances down (using less than about 30% of your limit helps), and correct any mistakes or add a notice of correction where something needs explaining.",
        ],
        bullets: [
          "Register to vote at your current address on the electoral roll",
          "Check Experian, Equifax and TransUnion and dispute any errors",
          "Pay everything on time — set up direct debits so nothing slips",
          "Keep credit-card balances below roughly 30% of the limit",
          "Avoid closing old, well-managed accounts just before applying",
        ],
        relatedStageIds: [1],
      },
      {
        h2: "What should I avoid in the run-up to applying?",
        paragraphs: [
          "The months before you apply matter more than most buyers realise. Lenders typically scrutinise your last three to six months of bank statements closely, so treat that window as your audit period. Avoid anything that makes you look stretched or that reduces how much you can borrow.",
          "Do not take on new credit — a car finance deal, a new phone contract on finance, or a fresh credit card can all cut your affordability at exactly the wrong moment and leave a hard search on your file. Steer clear of unauthorised overdrafts, gambling transactions, and payday loans, all of which lenders view poorly. If someone is gifting you deposit money, get it into your account early with a signed gift letter, because last-minute large deposits raise anti-money-laundering questions.",
        ],
        bullets: [
          "Don't apply for new loans, cards or 'buy now, pay later' before your mortgage",
          "Avoid unarranged overdrafts and returned direct debits",
          "Cut back on visible gambling spend in the months before applying",
          "Bank a gifted deposit early with a proper gift letter",
          "Don't change jobs mid-application if you can help it — lenders like stability",
        ],
        relatedStageIds: [1, 4],
      },
      {
        h2: "Does a bigger deposit or a broker help more?",
        paragraphs: [
          "Both help, in different ways. A larger deposit lowers your loan-to-value, which unlocks lower interest rates and widens the pool of lenders willing to say yes. Crossing a threshold — for example moving from a 5% deposit to 10%, or from 10% to 15% — often has more impact on your rate and approval odds than a small credit-score improvement. On a £250,000 home, 5% is £12,500, 10% is £25,000 and 15% is £37,500.",
          "A whole-of-market mortgage broker improves your odds by matching you to a lender whose criteria fit your circumstances — self-employed income, a new job, a smaller deposit or a past credit blip. Because they can see deals across the market and know each lender's rules, they help you avoid wasted applications and the hard credit searches that come with them. For first-time buyers, brokers are often free, as they are paid by the lender on completion.",
          "Finally, always get an Agreement in Principle (also called a Decision in Principle) before you house-hunt. It is a soft-check indication of what a lender would lend, it does not harm your credit file, and it shows sellers you are a serious, ready buyer.",
        ],
        relatedStageIds: [1, 4],
      },
    ],
    faqs: [
      {
        q: "What credit score do I need for a mortgage in the UK?",
        a: "There is no universal minimum — each lender uses its own scoring model, and there is no single national number. A strong, clean credit file with no missed payments and low balances matters far more than any one score. Affordability and deposit size often weigh more heavily than the score itself.",
      },
      {
        q: "How long before applying should I start improving my chances?",
        a: "Ideally three to six months. That gives time for positive changes — being on the electoral roll, paying down balances, keeping statements clean — to register on your credit file and for lenders to see a settled, stable pattern rather than a last-minute scramble.",
      },
      {
        q: "Will being rejected by one lender hurt future applications?",
        a: "A rejection itself is not recorded on your credit file, but the hard search that came with it is, and several hard searches in a short time can look like you're chasing credit. This is exactly why a whole-of-market broker helps — they match you to a suitable lender first so you avoid repeated failed applications.",
      },
      {
        q: "Can I get a mortgage as a first-time buyer with a 5% deposit?",
        a: "Yes. 5% deposit mortgages are widely available in 2026, helped by the government's Mortgage Guarantee Scheme. You'll usually pay a higher interest rate than with a 10% or 15% deposit, so if you can save a little more before applying, it can noticeably cut your monthly cost.",
      },
    ],
    relatedStageIds: [1, 4],
    publishDate: "2026-07-10",
  },

  // ──────────────────────────────────────────────────────────────────────
  // 13. GAZUMPING
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "gazumping-uk",
    guideTitle: "Gazumping UK: What It Is & How to Avoid It",
    headline: "Gazumping: what it is, why it's legal, and how to protect yourself",
    metaDescription:
      "Gazumping is when a seller accepts a higher offer after accepting yours. Learn why it's legal in England and Wales, and 6 practical ways to avoid it.",
    intro:
      "Gazumping is when a seller accepts your offer on a property, then accepts a higher (or otherwise better) offer from another buyer before contracts are exchanged. It is legal in England, Wales and Northern Ireland because an accepted offer is not binding until exchange — typically 8 to 12 weeks later. You can't eliminate the risk, but you can cut it sharply by getting the property taken off the market, moving fast on your mortgage, survey and conveyancing, and in some cases signing a lock-out agreement.",
    sections: [
      {
        h2: "What is gazumping and why does it happen?",
        paragraphs: [
          "In England, Wales and Northern Ireland, having an offer accepted creates no legal commitment on either side. The sale only becomes binding when contracts are exchanged, which usually happens 8 to 12 weeks after the offer is accepted — sometimes longer if there's a chain or conveyancing delays. During that whole window, the seller is free to accept a better offer from someone else.",
          "Gazumping is most common when prices are rising quickly or when a sale drags on. A rival buyer might offer more money, but sellers also switch for speed: a chain-free buyer with cash or a mortgage ready to go can 'gazump' you even with a similar offer. Estate agents are legally required to pass every offer to the seller right up until exchange, so interest from other buyers doesn't stop just because your offer was accepted.",
          "The financial sting is real. By the time a purchase falls through you may have already paid for a survey, conveyancing searches and mortgage arrangement — several hundred to a few thousand pounds that you generally cannot recover from the seller.",
        ],
        relatedStageIds: [3, 8],
      },
      {
        h2: "Is gazumping legal in the UK?",
        paragraphs: [
          "Yes — in England, Wales and Northern Ireland gazumping is legal, however frustrating it feels. Until written contracts are exchanged, an accepted offer is only an agreement in principle ('subject to contract'), and the seller can walk away or take a better offer without penalty. There is no law against it, and successive proposals to ban it have never made it into legislation.",
          "Scotland is different. There, once the seller's solicitor accepts an offer and missives (the contract letters) are concluded, the deal is legally binding — and this typically happens much earlier in the process than exchange does in England. Scottish solicitors' professional rules also generally prevent them from acting for a seller who tries to accept a rival offer after one has been accepted. Gazumping in Scotland is therefore rare, though not strictly impossible before missives are concluded.",
        ],
        relatedStageIds: [3, 5],
      },
      {
        h2: "How do I avoid being gazumped?",
        paragraphs: [
          "You can't remove the risk entirely in England and Wales, but the single biggest factor is time: the shorter the gap between offer acceptance and exchange, the less opportunity there is for a rival bid. Practical steps that make a real difference:",
        ],
        bullets: [
          "Make taking the property off the market a condition of your offer — ask the agent to remove the listing and mark it 'sold subject to contract' (SSTC), and check the listing actually comes down",
          "Have a mortgage in principle before you offer, so your full application can start the same week",
          "Instruct your solicitor or conveyancer before your offer is accepted, so searches begin immediately",
          "Book your survey as soon as the offer is accepted — waiting weeks for a surveyor is a classic source of fatal delay",
          "Respond to every solicitor query the same day and chase progress weekly so the sale keeps momentum",
          "Consider a lock-out agreement (see below) for extra protection on a purchase you really don't want to lose",
        ],
        relatedStageIds: [1, 5, 6],
      },
      {
        h2: "What is a lock-out agreement?",
        paragraphs: [
          "A lock-out agreement (also called an exclusivity agreement) is a legally binding contract in which the seller agrees not to negotiate with or accept offers from anyone else for a fixed period — commonly four to eight weeks. That window is designed to give you enough time to complete your survey, searches and mortgage application and reach exchange without being outbid.",
          "It doesn't force the seller to sell to you; it only takes the property off the table for other buyers during the exclusivity period. If the seller breaches it, you can claim back your wasted costs. Lock-out agreements are not standard practice — a solicitor needs to draft one, which adds cost, and not every seller will agree — but they're worth raising on a purchase where you'd be badly exposed, such as after paying for an expensive survey on an unusual property.",
        ],
        relatedStageIds: [5, 8],
      },
      {
        h2: "What should I do if I've been gazumped?",
        paragraphs: [
          "First, find out from the agent exactly what the rival offer is — not just the price, but the buyer's position. If they're in a long chain and you're not, you may be able to keep the deal by emphasising speed and certainty rather than matching the money. Sellers regularly stick with a slightly lower offer from a buyer who can definitely proceed.",
          "If you do consider increasing your offer, set a hard ceiling based on what the property is worth to you and what your lender will support — a higher price can mean a down-valuation and a bigger deposit requirement. Sometimes the right call is to walk away and put your money towards the next purchase rather than an emotional bidding war.",
          "You can also insure against the costs in advance. Home buyer protection insurance typically costs roughly £50 to £100, and reimburses a chunk of your conveyancing, survey and mortgage fees if the purchase falls through due to gazumping or other specified reasons. Buy it when your offer is accepted, not after things go wrong.",
        ],
        relatedStageIds: [3, 6],
      },
    ],
    faqs: [
      {
        q: "Is gazumping illegal in the UK?",
        a: "No. In England, Wales and Northern Ireland gazumping is legal because an accepted offer is not binding until contracts are exchanged. In Scotland the system is different: offers accepted through solicitors become binding once missives are concluded, which makes gazumping rare there.",
      },
      {
        q: "Can I sue the seller or get my money back if I'm gazumped?",
        a: "Generally no — because there's no binding contract before exchange, the seller owes you nothing, and survey, search and legal fees are usually lost. The exceptions are if you had a signed lock-out agreement the seller breached, or if you bought home buyer protection insurance, which reimburses specified costs when a purchase falls through.",
      },
      {
        q: "Does 'sold subject to contract' stop gazumping?",
        a: "It reduces it but doesn't prevent it. 'Sold subject to contract' signals the property is under offer, but the sale still isn't binding, and agents must by law pass on any new offers to the seller until exchange. Getting the listing removed entirely is stronger than an SSTC label on a live listing.",
      },
      {
        q: "What is gazundering?",
        a: "Gazundering is the reverse tactic: the buyer lowers their offer late in the process, often just before exchange, when the seller is under pressure to accept rather than restart the sale. Like gazumping, it's legal in England and Wales because nothing is binding until contracts are exchanged.",
      },
    ],
    relatedStageIds: [2, 3, 5, 8],
    publishDate: "2026-07-14",
  },
];

export function topicGuideBySlug(slug: string): TopicGuide | undefined {
  return TOPIC_GUIDES.find((g) => g.slug === slug);
}
