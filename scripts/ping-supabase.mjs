const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const endpoint = new URL("/auth/v1/settings", supabaseUrl).toString();

try {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  const body = await response.text();

  console.log("Ping endpoint:", endpoint);
  console.log("Status:", response.status);
  console.log("Body preview:", body.slice(0, 300));

  if (!response.ok) {
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Ping failed:", message);
  process.exit(1);
}
