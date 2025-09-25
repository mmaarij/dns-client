# DNS Client

A simple DNS client written in TypeScript. This project allows you to perform DNS queries from the command line using Node.js.

## Features
- Query DNS records (A, AAAA CNAME and NS)
- Command line interface

## Prerequisites
- Node.js
- npm

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Usage

### CLI Usage

Run the CLI to perform DNS queries:

```bash
npx ts-node src/cli/cli.ts <recordType> <domain>
```

- `<recordType>`: DNS record type (A, AAAA, CNAME, NS)
- `<domain>`: The domain name to query (e.g., `example.com`)

#### Example

```bash
npx ts-node src/cli/cli.ts A example.com
```

### Web Usage

You can also use the DNS client from your browser:

1. Start the server:
	```bash
	npx ts-node src/server/server.ts
	```
2. Open your browser and go to [http://localhost:3000](http://localhost:3000)
3. Enter a domain and select a record type in the form on the left, then click "Query DNS".
4. Results will be displayed in the table on the right.

## Project Structure

```
dns-client/
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
├── src/
│   ├── cli/
│   │   └── cli.ts          # CLI entry point
│   └── dns/
│       ├── index.ts        # Barrel file: re-exports DNS modules
│       ├── DNSClient.ts    # DNS client implementation
│       ├── DNSQuery.ts     # DNS query builder
│       ├── DNSBuffer.ts    # DNS packet buffer utilities
│       └── RecordType.ts   # DNS record type definitions
```