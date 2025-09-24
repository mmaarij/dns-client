# DNS Client

A simple DNS client written in TypeScript. This project allows you to perform DNS queries from the command line using Node.js.

## Features
- Query DNS records (A, AAAA and CNAME)
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

- `<recordType>`: DNS record type (A, AAAA, CNAME)
- `<domain>`: The domain name to query (e.g., `example.com`)

### Example

```bash
npx ts-node src/cli/cli.ts A example.com
```

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