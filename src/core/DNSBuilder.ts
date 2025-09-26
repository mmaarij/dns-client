import { DNSBuffer } from "./DNSBuffer";
import { DNSRecordType } from "../domain/DNSRecordType";

/**
 * DNSBuilder
 *
 * Utility for building DNS query packets.
 * Implements IDNSPacketBuilder for Clean Architecture.
 *
 * Example:
 *   const builder = new DNSBuilder();
 *   const packet = builder.build("example.com", DNSRecordType.A, 1234);
 */
export class DNSBuilder {
  /**
   * Build a DNS query packet.
   * Implements IDNSPacketBuilder interface.
   */
  build(domain: string, type: DNSRecordType, id: number): Buffer {
    if (!domain) throw new Error("Domain cannot be empty");

    const buf = new DNSBuffer();
    buf.writeUint16(id);
    buf.writeUint16(0x0100); // recursion desired
    buf.writeUint16(1); // QDCOUNT
    buf.writeUint16(0); // ANCOUNT
    buf.writeUint16(0); // NSCOUNT
    buf.writeUint16(0); // ARCOUNT
    buf.writeName(domain);
    buf.writeUint16(type);
    buf.writeUint16(1); // IN class
    return buf.toBuffer();
  }
}
