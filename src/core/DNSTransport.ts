import dgram from "dgram";
import { DNSConfig } from "../domain/DNSConfig";

/**
 * DNSTransport
 *
 * Handles UDP transport for DNS queries and responses.
 * Implements ITransport for Clean Architecture.
 *
 * Example:
 *   const config = new DNSConfig();
 *   const transport = new DNSTransport(config);
 *   const response = await transport.send(packet);
 */
export class DNSTransport {
  private config: DNSConfig;

  /**
   * Create a DNS transport instance.
   * @param config DNSConfig instance for server, port, timeout
   */
  constructor(config: DNSConfig = new DNSConfig()) {
    this.config = config;
  }

  /**
   * Send a DNS packet and await the response.
   * @param packet Buffer containing the DNS query packet.
   * @returns Promise resolving to the response buffer.
   */
  async send(packet: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket("udp4");

      const timer = setTimeout(() => {
        socket.close();
        reject(new Error("DNS query timed out"));
      }, this.config.timeout);

      socket.on("message", (msg) => {
        clearTimeout(timer);
        socket.close();
        resolve(msg);
      });

      socket.send(packet, this.config.port, this.config.server);
    });
  }
}
