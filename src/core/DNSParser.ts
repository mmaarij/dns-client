import { DNSBuffer } from "./DNSBuffer";
import { DNSRecordType } from "../domain/DNSRecordType";

/**
 * DNS response parser for extracting answer records from a DNS packet.
/**
 * DNSParser
 *
 * DNS response parser for extracting answer records from a DNS packet.
 * Implements IDNSPacketParser for Clean Architecture.
 *
 * Example:
 *   const parser = new DNSParser();
 *   const answers = parser.parse(responseBuffer);
 */
type AnswerRecord = [string, string];
type RecordHandler = (buf: DNSBuffer, data: Buffer) => AnswerRecord | undefined;

const recordHandlers: Record<DNSRecordType, RecordHandler> = {
  [DNSRecordType.A]: (buf, data) => {
    const ip = Array.from(data.subarray(buf.position, buf.position + 4)).join(
      "."
    );
    return ["A", ip];
  },
  [DNSRecordType.AAAA]: (buf, data) => {
    const raw = data.subarray(buf.position, buf.position + 16);
    const ip = Array.from({ length: 8 }, (_, j) =>
      raw.readUInt16BE(j * 2).toString(16)
    ).join(":");
    return ["AAAA", ip];
  },
  [DNSRecordType.CNAME]: (buf) => {
    const cname = buf.readName();
    return ["CNAME", cname];
  },
  [DNSRecordType.NS]: (buf) => {
    const ns = buf.readName();
    return ["NS", ns];
  },
  [DNSRecordType.MX]: (buf) => {
    buf.readUint16(); // priority
    const exchange = buf.readName();
    return ["MX", exchange];
  },
  [DNSRecordType.TXT]: (buf, data) => {
    const txtLen = data[buf.position];
    if (txtLen) {
      const txt = data
        .subarray(buf.position + 1, buf.position + 1 + txtLen)
        .toString();
      buf.advance(1 + txtLen);
      return ["TXT", txt];
    }
    return undefined;
  },
};

export class DNSParser {
  /**
   * Parse a DNS response packet and extract answer records.
   * Implements IDNSPacketParser interface.
   */
  parse(data: Buffer): AnswerRecord[] {
    const buf = new DNSBuffer(data);

    buf.readUint16(); // ID
    buf.readUint16(); // flags
    const qdcount = buf.readUint16();
    const ancount = buf.readUint16();
    buf.readUint16(); // NSCOUNT
    buf.readUint16(); // ARCOUNT

    // Skip questions
    for (let i = 0; i < qdcount; i++) {
      buf.readName();
      buf.readUint16();
      buf.readUint16();
    }

    const answers: AnswerRecord[] = [];

    for (let i = 0; i < ancount; i++) {
      buf.readName();
      const rtype = buf.readUint16();
      buf.readUint16(); // class
      buf.readUint32(); // ttl
      const rdlen = buf.readUint16();

      const handler = recordHandlers[rtype as DNSRecordType];
      if (handler) {
        const answer = handler(buf, data);
        if (answer) answers.push(answer);
        if (
          rtype === DNSRecordType.CNAME ||
          rtype === DNSRecordType.NS ||
          rtype === DNSRecordType.MX ||
          rtype === DNSRecordType.TXT
        ) {
          continue;
        }
      }
      buf.advance(rdlen);
    }

    return answers;
  }
}
