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

Run the CLI to perform DNS queries directly with ts-node (if installed):

```bash
npx ts-node src/cli.ts <domain> <recordType>
```

- `<domain>`: The domain name to query (e.g., `example.com`)
- `<recordType>`: DNS record type


## Project Structure
- `src/cli.ts`: Command-line interface entry point
- `src/dns.ts`: DNS query logic
- `package.json`: Project metadata and scripts
- `tsconfig.json`: TypeScript configuration