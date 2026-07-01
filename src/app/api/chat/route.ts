// The interactive assistant is not part of the current Clinkeys release.
// This endpoint is intentionally disabled until the guided dashboard launches.
export const runtime = "nodejs";

export async function POST() {
  return new Response(
    JSON.stringify({
      error:
        "The Clinkeys assistant isn't available yet. Join the list to hear when it launches.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}
