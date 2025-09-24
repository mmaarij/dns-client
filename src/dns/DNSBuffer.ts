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

export class DNSBuffer {
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