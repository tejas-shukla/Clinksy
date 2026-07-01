// Task tips — one per action across all 10 stages.
// Keyed by "${stageId}-${actionIndex}".
// Each tip includes an emoji, a practical insight, and an optional reference link.

export type TaskTip = {
  emoji: string;
  tip: string;
  linkLabel?: string;
  linkHref?: string;
};

export const TASK_TIPS: Record<string, TaskTip> = {
  // Stage 1 — Work out how much you can borrow
  "1-0": {
    emoji: "📊",
    tip: "Soft checks don't affect your score. Look for errors — even a wrong address can reduce your credit rating. ClearScore and Experian are both free.",
    linkLabel: "ClearScore (free)",
    linkHref: "https://www.clearscore.com",
  },
  "1-1": {
    emoji: "🤝",
    tip: "Whole-of-market brokers see 90+ lenders. Your bank only shows its own products. Brokers are free for buyers — lenders pay their fee.",
    linkLabel: "Find a broker (Habito)",
    linkHref: "https://www.habito.com",
  },
  "1-2": {
    emoji: "💡",
    tip: "The AIP figure is a ceiling, not a target. Model what happens if rates rise 2% — your monthly payment must stay comfortable at that higher level.",
  },

  // Stage 2 — Find your home
  "2-0": {
    emoji: "🔔",
    tip: "Set alerts on Rightmove, Zoopla, AND OnTheMarket — each gets exclusive listings first. Serious buyers monitor all three simultaneously.",
    linkLabel: "Rightmove alerts",
    linkHref: "https://www.rightmove.co.uk/property-for-sale.html",
  },
  "2-1": {
    emoji: "🏡",
    tip: "Visit at different times of day — morning light hides north-facing rooms. Always check phone signal, broadband speed (Ofcom checker), EPC rating, and flood risk.",
    linkLabel: "Ofcom broadband checker",
    linkHref: "https://checker.ofcom.org.uk",
  },
  "2-2": {
    emoji: "💬",
    tip: "A motivated seller (divorce, chain-free, emigrating) may accept 10–15% below asking. The reason they're selling is the most valuable information you can gather.",
  },

  // Stage 3 — Make an offer
  "3-0": {
    emoji: "📋",
    tip: "Look up actual sold prices — not asking prices — on HM Land Registry. Comparable properties that completed in the last 6 months are your strongest negotiating evidence.",
    linkLabel: "Land Registry sold prices (free)",
    linkHref: "https://www.gov.uk/search-house-prices",
  },
  "3-1": {
    emoji: "✍️",
    tip: "Put your offer in writing via email. Include conditions: off-market request, fixtures included, and your AIP reference number to prove you're ready to proceed immediately.",
  },
  "3-2": {
    emoji: "🛡️",
    tip: "Requesting removal from portals signals commitment and deters other viewings — but it doesn't legally prevent gazumping. Nothing does until contracts exchange.",
  },

  // Stage 4 — Secure a mortgage offer
  "4-0": {
    emoji: "📁",
    tip: "Gather everything before the broker submits. A complete application is processed in 2–4 weeks; incomplete ones can stall for months while the lender requests missing items.",
  },
  "4-1": {
    emoji: "🔍",
    tip: "The Key Facts Illustration (KFI) shows the total cost over the full mortgage term — not just the headline rate. Check the comparison rate and total repayable amount carefully.",
    linkLabel: "FCA mortgage guide",
    linkHref: "https://www.fca.org.uk/consumers/mortgages",
  },
  "4-2": {
    emoji: "⚠️",
    tip: "Don't change jobs, open any new credit, or make large purchases during underwriting. Even a new phone contract can trigger a re-assessment and delay your offer.",
  },

  // Stage 5 — Kick-start the legal process
  "5-0": {
    emoji: "⚖️",
    tip: "Your solicitor must be on your lender's approved panel or you'll pay for two legal teams. Always confirm panel status before instructing — this is the single most expensive mistake buyers make.",
    linkLabel: "Law Society find a solicitor",
    linkHref: "https://solicitors.lawsociety.org.uk",
  },
  "5-1": {
    emoji: "🪪",
    tip: "Solicitors must verify identity under anti-money laundering law. Have your passport and a utility bill dated within 3 months ready from day one — delays here hold up the whole chain.",
  },
  "5-2": {
    emoji: "📝",
    tip: "The TA6 (property info) and TA10 (fixtures & fittings) forms reveal disputes, planning issues, Japanese knotweed, and what white goods are included. Read every line — your solicitor can advise on red flags.",
  },

  // Stage 6 — Sort a property survey
  "6-0": {
    emoji: "🔬",
    tip: "Level 2 HomeBuyer suits most post-1930 homes. Level 3 Full Structural is worth the extra £400–600 for pre-war, listed, or unusual buildings — the detail it provides pays for itself.",
    linkLabel: "RICS surveyor finder",
    linkHref: "https://www.rics.org/uk/surveying-profession/find-a-surveyor",
  },
  "6-1": {
    emoji: "⏰",
    tip: "Book your survey before your mortgage offer expires — most offers last 3–6 months. Don't let the survey window run into your offer deadline.",
  },
  "6-2": {
    emoji: "💰",
    tip: "Get 2–3 contractor quotes for any issues flagged. Share them with the estate agent and ask for a price reduction. Sellers often accept rather than risk losing the sale entirely.",
  },

  // Stage 7 — Arrange buildings insurance
  "7-0": {
    emoji: "🏠",
    tip: "Use price comparison sites but also check Aviva and Direct Line directly — they don't always appear on aggregators. Get at least 3 quotes.",
    linkLabel: "Compare buildings insurance",
    linkHref: "https://www.moneysupermarket.com/home-insurance",
  },
  "7-1": {
    emoji: "📐",
    tip: "The rebuild value is in the lender's valuation report. It's often less than the market price (no land cost) but can be more for period properties. Never insure for the purchase price.",
  },
  "7-2": {
    emoji: "📅",
    tip: "You're legally bound to buy from exchange — not completion. If the property is damaged between exchange and completion, insurance is what protects you. Start from exchange date.",
  },

  // Stage 8 — Get ready to exchange contracts
  "8-0": {
    emoji: "📆",
    tip: "Everyone in the chain must agree the same completion date. Avoid Fridays if possible — if funds are delayed, you have no fallback until Monday. Wednesday and Thursday are safer.",
  },
  "8-1": {
    emoji: "💸",
    tip: "CHAPS transfers are same-day but cost £25–35 and require 24–48 hours notice from your bank for large sums. Arrange this the week before — not on the day.",
    linkLabel: "CHAPS explained",
    linkHref: "https://www.psr.org.uk/payment-systems/chaps",
  },
  "8-2": {
    emoji: "📑",
    tip: "Your solicitor will brief you on the contract before signing. After exchange, pulling out means you lose your 10% deposit and can be sued for more. Ask any questions before you sign — not after.",
  },

  // Stage 9 — Prepare for completion and move in
  "9-0": {
    emoji: "🚛",
    tip: "Book removals 3–4 weeks in advance — Friday completions in summer fill up very fast. Ask if the firm includes disassembly, insurance, and whether they're members of the BAR.",
    linkLabel: "British Association of Removers",
    linkHref: "https://www.bar.co.uk",
  },
  "9-1": {
    emoji: "📦",
    tip: "Pack room-by-room and label every box with contents and destination room. Move passports, keys, medications, and a night-bag in your own car — not on the van.",
  },
  "9-2": {
    emoji: "📸",
    tip: "Photograph every meter on move-in day and submit readings immediately. This creates a clear record and prevents billing disputes with previous suppliers.",
  },

  // Stage 10 — Complete the final steps
  "10-0": {
    emoji: "✅",
    tip: "SDLT must be paid within 14 days of completion — your solicitor usually handles this, but confirm it's been filed. Late payment triggers automatic penalties.",
    linkLabel: "SDLT rates (gov.uk)",
    linkHref: "https://www.gov.uk/stamp-duty-land-tax",
  },
  "10-1": {
    emoji: "🏛️",
    tip: "Priority addresses to update: HMRC, employer, bank, DVLA, GP, electoral roll, and pension providers. Royal Mail redirection (~£35 for 6 months) catches anything you miss.",
    linkLabel: "Royal Mail redirection",
    linkHref: "https://www.royalmail.com/personal/receiving-mail/redirection",
  },
  "10-2": {
    emoji: "💡",
    tip: "Contact utility providers on completion day with meter readings — not the day after. Responsibility transfers at completion, so readings from that exact date matter.",
  },
};
