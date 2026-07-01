---
name: Buyer↔Advisor chat — pending auth work
description: Open item to address before Clinksy development is called final
type: feedback
---

The buyer↔advisor chat (`/api/conversations`, `src/lib/chat-store.ts`,
`src/components/chat/AdvisorChat.tsx`) is wired into both portals but the API
is currently UNAUTHENTICATED — it is scoped only by buyer email.

ACTION: Before Tej declares development final, remind him to add an auth layer:
- Verify the buyer's session cookie on buyer-side requests.
- Give the advisor portal a real server-side identity (it's localStorage-only today)
  and authorise advisor writes against their assigned clients.

Tej explicitly deferred this ("not the auth layer yet") and asked to be reminded.

Poll interval for the chat was lowered to 2000ms (from 5000ms) on his request.
