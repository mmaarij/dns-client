/**
 * DNS Client Library
 *
 * Usage Example (default DNSClient):
 *
 *   import { DNSClient, DNSRecordType } from "your-lib";
 *   const client = new DNSClient();
 *   const answers = await client.query("example.com", DNSRecordType.A);
 *
 * Usage Example (Clean Architecture):
 *
 *   import {
 *     DNSQueryService,
 *     DNSBuilder,
 *     DNSParser,
 *     DNSTransport,
 *     DNSRecordType
 *   } from "your-lib";
 *
 *   const service = new DNSQueryService(
 *     new DNSBuilder(),
 *     new DNSParser(),
 *     new DNSTransport()
 *   );
 *   const answers = await service.query("example.com", DNSRecordType.A);
 *
 * Interfaces are exported for custom implementations:
 *   - IDNSPacketBuilder
 *   - IDNSPacketParser
 *   - ITransport
 */
export { DNSQueryService } from "./src/application/DNSQueryService";
export type { IDNSPacketBuilder } from "./src/domain/IDNSPacketBuilder";
export type {
  IDNSPacketParser,
  AnswerRecord,
} from "./src/domain/IDNSPacketParser";
export type { ITransport } from "./src/domain/ITransport";
export { DNSBuilder } from "./src/core/DNSBuilder";
export { DNSParser } from "./src/core/DNSParser";
export { DNSTransport } from "./src/core/DNSTransport";
export { DNSRecordType } from "./src/domain/DNSRecordType";
export { DNSConfig } from "./src/domain/DNSConfig";
