const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

try {
  // Query the REST API to trigger actual database activity
  const restEndpoint = new URL("/rest/v1/orders?limit=1", supabaseUrl).toString();

  console.log("Pinging Supabase with database query...");
  console.log("Endpoint:", restEndpoint);

  const response = await fetch(restEndpoint, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Status:", response.status);

  if (!response.ok) {
    const body = await response.text();
    console.error("Response:", body);
    process.exit(1);
  }

  const data = await response.json();
  console.log("✓ Successfully queried database");
  console.log("Records returned:", Array.isArray(data) ? data.length : 0);
  console.log("Timestamp:", new Date().toISOString());
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Ping failed:", message);
  process.exit(1);
}
