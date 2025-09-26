/**
 * Supported DNS record types.
 */
export enum DNSRecordType {
  /** IPv4 address record */
  A = 1,
  /** Canonical name record */
  CNAME = 5,
  /** IPv6 address record */
  AAAA = 28,
  /** Name server record */
  NS = 2,
  /** Mail exchange record */
  MX = 15,
  /** Text record */
  TXT = 16,
}
