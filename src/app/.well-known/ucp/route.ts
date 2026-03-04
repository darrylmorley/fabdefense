const BACKEND_URL =
  process.env.BACKEND_URL || "https://api.shootingsuppliesltd.co.uk";

export async function GET() {
  const manifest = {
    ucp_version: "2026-01-11",
    checkout_sessions_url: `${BACKEND_URL}/ucp/fabdefense/checkout-sessions`,
    orders_url: `${BACKEND_URL}/ucp/fabdefense/orders`,
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
