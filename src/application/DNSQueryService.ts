// Application Layer: DNS query orchestrator
import { DNSRecordType } from "../domain/DNSRecordType";
import type { IDNSPacketBuilder } from "../domain/IDNSPacketBuilder";
import type {
  IDNSPacketParser,
  AnswerRecord,
} from "../domain/IDNSPacketParser";
import type { ITransport } from "../domain/ITransport";

/**
 * DNSQueryService (Application Layer)
 *
 * Orchestrates DNS queries using injected builder, parser, and transport implementations.
 *
 * Example:
 *   const service = new DNSQueryService(
 *     new DNSBuilder(),
 *     new DNSParser(),
 *     new DNSTransport(new DNSConfig())
 *   );
 *   const answers = await service.query("example.com", DNSRecordType.A);
 */
export class DNSQueryService {
  /**
   * @param builder DNS packet builder implementation
   * @param parser DNS packet parser implementation
   * @param transport Transport implementation (e.g., UDP)
   */
  constructor(
    private builder: IDNSPacketBuilder,
    private parser: IDNSPacketParser,
    private transport: ITransport
  ) {}

  /**
   * Send a DNS query and parse the response.
   * @param domain The domain name to query.
   * @param type The DNS record type.
   * @returns Array of [type, value] tuples from the answer section.
   */
  async query(domain: string, type: DNSRecordType): Promise<AnswerRecord[]> {
    const id = Math.floor(Math.random() * 65536);
    const packet = this.builder.build(domain, type, id);
    const response = await this.transport.send(packet);
    return this.parser.parse(response);
  }
}
