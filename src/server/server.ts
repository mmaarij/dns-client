import { DNSClient, DNSQuery } from "../dns"
import express from "express";

const app = express()
const client = new DNSClient();
const port = 3000

app.use(express.static('src/frontend'))

app.listen(port, () => {
  console.log(`Server active on http://localhost:${port}`)
});

/**
 * GET /query
 * DNS query endpoint. Accepts 'type' and 'domain' query parameters.
 *
 * @route GET /query
 * @param {string} req.query.type - DNS record type (A, AAAA, CNAME, NS)
 * @param {string} req.query.domain - Domain name to query
 * @returns {Object} 200 - JSON object with DNS results
 * @returns {Object} 400 - Error message for missing/invalid parameters
 * @returns {Object} 500 - Internal server error
 */
app.get('/query', async(req, res) => {
  const { type, domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }
  
  if (!type || !["A", "AAAA", "CNAME", "NS"].includes(type.toString().toUpperCase())) {
    return res.status(400).json({ error: "Invalid or missing type parameter. Use A, AAAA, CNAME or NS" });
  }

  try {
  let query: DNSQuery | undefined;
  switch (type.toString().toUpperCase()) {
      case "A": query = DNSQuery.a(domain as string); break;
      case "AAAA": query = DNSQuery.aaaa(domain as string); break;
      case "CNAME": query = DNSQuery.cname(domain as string); break;
      case "NS": query = DNSQuery.ns(domain as string); break;
  }

  if (!query) {
    return res.status(400).json({ error: "Failed to construct DNS query" });
  }

  const results = await client.query(query);
  res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});