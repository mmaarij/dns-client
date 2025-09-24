import { DNSClient, DNSQuery } from "../dns";

async function main() {
  const [,, type, domain] = process.argv;
  if (!type || !domain) {
    console.error("Usage: ts-node src/cli.ts <A|AAAA|CNAME> <domain>");
    process.exit(1);
  }

  let query: DNSQuery;
  switch (type.toUpperCase()) {
    case "A": query = DNSQuery.a(domain); break;
    case "AAAA": query = DNSQuery.aaaa(domain); break;
    case "CNAME": query = DNSQuery.cname(domain); break;
    default:
      console.error("Invalid query type. Use A, AAAA, or CNAME");
      process.exit(1);
  }

  const client = new DNSClient();
  try {
    const answers = await client.query(query);
    for (const [rtype, val] of answers) {
      console.log(`${rtype}: ${val}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
