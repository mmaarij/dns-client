import dgram from "dgram";

/**
 * Supported DNS record types.
 */
export enum RecordType {
  /** IPv4 address record */
  A = 1,
  /** Canonical name record */
  CNAME = 5,
  /** IPv6 address record */
  AAAA = 28,
}

/**
 * Util class for encoding and decoding DNS packets.
 *
 * Works in two modes:
 *   - Writing mode (no buffer passed): accumulates bytes in an internal array.
 *     Use writeUint16(), writeUint32(), writeName(), etc to construct a packet,
 *     then call toBuffer() to get a Nodejs Buffer for sending over the network.
 *
 *   - Reading mode (buffer passed in constructor): uses an existing Buffer
 *     i.e. a UDP response from a DNS server. Use readUint16(), readUint32(),
 *     readName() etc to decode fields while advancing an internal offset.
 *
 * This design avoids maintaining separate classes for reader/writer,
 * but it means that read methods throw error if no input buffer is provided.
 *
 * All integers are encoded/decoded in network byte order (big endian).
 * Domain names are written and read using DNS label encoding and supporting
 * domain name compression pointers during decoding.
 */

class DNSBuffer {
  private buf: number[] = [];
  private offset = 0;

  /**
   * @param data Optional buffer to use for reading
   */
  constructor(private data?: Buffer) {}

  /**
   * Write a 16 bit unsigned integer in network byte order.
   * @param val The value to write.
   */
  writeUint16(val: number) {
    this.buf.push((val >> 8) & 0xff, val & 0xff);
  }

  /**
   * Write a 32 bit unsigned integer in network byte order.
   * @param val The value to write.
   */
  writeUint32(val: number) {
    this.buf.push(
      (val >> 24) & 0xff,
      (val >> 16) & 0xff,
      (val >> 8) & 0xff,
      val & 0xff
    );
  }

  /**
   * Write a DNS encoded domain name.
   * @param name The domain name (e.g "example.com").
   */
  writeName(name: string) {
    for (const label of name.split(".")) {
      this.buf.push(label.length);
      for (const c of label) this.buf.push(c.charCodeAt(0));
    }
    this.buf.push(0); // terminator
  }

  /**
   * Read a 16 bit unsigned integer in network byte order.
   * @returns The decoded value.
   */
  readUint16(): number {
    if (!this.data) throw new Error("Buffer not initialized for reading");
    const val = this.data.readUInt16BE(this.offset);
    this.offset += 2;
    return val;
  }

  /**
   * Read a 32 bit unsigned integer in network byte order.
   * @returns The decoded value.
   */
  readUint32(): number {
    if (!this.data) throw new Error("Buffer not initialized for reading");
    const val = this.data.readUInt32BE(this.offset);
    this.offset += 4;
    return val;
  }

  /**
   * Read a DNS encoded domain name, handling compression pointers.
   * @returns The decoded domain name as a string.
   */
  readName(): string {
    if (!this.data) throw new Error("Buffer not initialized for reading");
    const labels: string[] = [];
    while (true) {
      const len = this.data[this.offset++];
      if (len === 0) break;

      // handle name compression
      if ((len & 0xc0) === 0xc0) {
        const ptr = ((len & 0x3f) << 8) | this.data[this.offset++];
        const saved = this.offset;
        this.offset = ptr;
        labels.push(this.readName());
        this.offset = saved;
        return labels.join(".");
      }

      const label = this.data
        .subarray(this.offset, this.offset + len)
        .toString("ascii");
      labels.push(label);
      this.offset += len;
    }
    return labels.join(".");
  }

  /**
   * Get the accumulated bytes as a buffer.
   * @returns A nodejs Buffer containing the written data.
   */
  toBuffer(): Buffer {
    return Buffer.from(this.buf);
  }

  /**
   * Advance the read offset by a number of bytes.
   * @param n Number of bytes to skip.
   */
  advance(n: number) {
    this.offset += n;
  }

  /**
   * Current read offset (position) in the buffer.
   */
  get position() {
    return this.offset;
  }
}

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
      }

      buf.advance(rdlen);
    }

    return answers;
  }
}
