/**
 * DNSConfig
 *
 * Configuration class for DNS server, port, and timeout settings.
 * Provides default values and allows custom settings.
 *
 * Example:
 *   const config = new DNSConfig(); // default: 8.8.8.8:53, 3000ms
 *   const custom = new DNSConfig("1.1.1.1", 53, 5000);
 */
export class DNSConfig {
  constructor(
    public server: string = "8.8.8.8",
    public port: number = 53,
    public timeout: number = 3000
  ) {}
}
