import dgram from "dgram";
import { DNSQuery } from "./DNSQuery";
import { DNSBuffer } from "./DNSBuffer";
import { RecordType } from "./RecordType";

/**
 * DNS client for sending queries to a remote DNS server
 * and parsing responses.
 */
export class DNSClient {
  /**
   * @param server DNS server address (default: 8.8.8.8 i.e Google DNS).
   * @param port DNS server port (default: 53).
   * @param timeout Query timeout in milliseconds (default: 5000).
   */
  constructor(
    private server = "8.8.8.8",
    private port = 53,
    private timeout = 5000
  ) {}

  /**
   * Send a DNS query to the configured server.
   * @param query The query to send.
   * @returns A promise that resolves with an array of [recordType, value] pairs.
   */
  async query(query: DNSQuery): Promise<[string, string][]> {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket("udp4");
      const packet = query.pack();

      const timer = setTimeout(() => {
        socket.close();
        reject(new Error("DNS query timed out"));
      }, this.timeout);

      socket.on("message", (msg) => {
        clearTimeout(timer);
        socket.close();
        resolve(this.parseResponse(msg));
      });

      socket.send(packet, this.port, this.server);
    });
  }

  /**
   * Parse a DNS response packet into readable answers.
   * @param data The raw DNS response buffer.
   * @returns An array of [recordType, value] pairs.
   */
  private parseResponse(data: Buffer): [string, string][] {
    const buf = new DNSBuffer(data);

    buf.readUint16(); // ID
    buf.readUint16(); // flags
    const qdcount = buf.readUint16();
    const ancount = buf.readUint16();
    buf.readUint16(); // nscount
    buf.readUint16(); // arcount

    // Skip question section
    for (let i = 0; i < qdcount; i++) {
      buf.readName();
      buf.readUint16();
      buf.readUint16();
    }

    const answers: [string, string][] = [];

    for (let i = 0; i < ancount; i++) {
      buf.readName();
      const rtype = buf.readUint16();
      buf.readUint16(); // class
      buf.readUint32(); // ttl
      const rdlen = buf.readUint16();

      if (rtype === RecordType.A) {
        const ip = Array.from(
          data.subarray(buf.position, buf.position + 4)
        ).join(".");
        answers.push(["A", ip]);
      } else if (rtype === RecordType.AAAA) {
        const raw = data.subarray(buf.position, buf.position + 16);
        const ip = Array.from({ length: 8 }, (_, j) =>
          raw.readUInt16BE(j * 2).toString(16)
        ).join(":");
        answers.push(["AAAA", ip]);
      } else if (rtype === RecordType.CNAME) {
        const cname = buf.readName();
        answers.push(["CNAME", cname]);
        continue;
      } else if (rtype === RecordType.NS) {
        const ns = buf.readName();
        answers.push(["NS", ns]);
        continue;
      }

      buf.advance(rdlen);
    }

    return answers;
  }
}