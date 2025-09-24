import { DNSBuffer } from "./DNSBuffer";
import { RecordType } from "./RecordType";

/**
 * Represents a DNS query for a specific domain and record type.
 */
export class DNSQuery {
  private id: number;

  /**
   * @param qname Domain name being queried.
   * @param qtype Record type (A, AAAA, or CNAME).
   */
  constructor(private qname: string, private qtype: RecordType) {
    this.id = Math.floor(Math.random() * 65536);
  }

  /**
   * Create an IPv4 (A record) query.
   * @param domain The domain name.
   */
  static a(domain: string) {
    return new DNSQuery(domain, RecordType.A);
  }

  /**
   * Create an IPv6 (AAAA record) query.
   * @param domain The domain name.
   */
  static aaaa(domain: string) {
    return new DNSQuery(domain, RecordType.AAAA);
  }

  /**
   * Create a CNAME (alias record) query.
   * @param domain The domain name.
   */
  static cname(domain: string) {
    return new DNSQuery(domain, RecordType.CNAME);
  }

  /**
   * Encode this query into a raw DNS packet buffer.
   * @returns Buffer representing the DNS query.
   */
  pack(): Buffer {
    const buf = new DNSBuffer();
    buf.writeUint16(this.id);
    buf.writeUint16(0x0100); // recursion desired
    buf.writeUint16(1); // one question
    buf.writeUint16(0); // no answers
    buf.writeUint16(0); // no authority
    buf.writeUint16(0); // no additional
    buf.writeName(this.qname);
    buf.writeUint16(this.qtype);
    buf.writeUint16(1); // IN class
    return buf.toBuffer();
  }

  /**
   * The record type for this query.
   */
  get type() {
    return this.qtype;
  }
}