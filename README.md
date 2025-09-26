# dns-client

TypeScript DNS client library for Bun/Node.js. Query DNS records (A, AAAA, CNAME, MX, NS, TXT) from your own applications. Built with Clean Architecture for flexibility.

## Quick Start

### Usage

```typescript
import {
  DNSQueryService,
  DNSBuilder,
  DNSParser,
  DNSTransport,
  DNSRecordType,
  DNSConfig,
} from "dns-client";

// Use default config
const service = new DNSQueryService(
  new DNSBuilder(),
  new DNSParser(),
  new DNSTransport()
);
const answers = await service.query("example.com", DNSRecordType.A);
console.log(answers);

// Or use custom config
const customConfig = new DNSConfig("1.1.1.1", 53, 5000);
const customTransport = new DNSTransport(customConfig);
const customService = new DNSQueryService(
  new DNSBuilder(),
  new DNSParser(),
  customTransport
);
const customAnswers = await customService.query("gmail.com", DNSRecordType.TXT);
console.log(customAnswers);
```

### Custom Implementations

You can implement your own packet builder, parser, or transport by using the exported interfaces:

- `IDNSPacketBuilder`
- `IDNSPacketParser`
- `ITransport`

## API Reference

- `DNSQueryService.query(domain: string, type: DNSRecordType): Promise<[string, string][]>`
- Supported record types: `DNSRecordType.A`, `AAAA`, `CNAME`, `MX`, `NS`, `TXT`
- All core classes and interfaces are exported for extension and testing.

## Architecture

The library is organized for Clean Architecture:

- **Domain Layer**: Core interfaces and types (e.g., packet builder, parser, transport, `DNSRecordType`, `DNSConfig`)
- **Application Layer**: `DNSQueryService` orchestrates DNS queries using injected interfaces
- **Implementation Layer**: Default classes implementing domain interfaces (UDP transport, packet builder, parser)
