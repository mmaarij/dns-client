// Domain Layer: Interface for DNS packet builder
import { DNSRecordType } from "../domain/DNSRecordType";

export interface IDNSPacketBuilder {
  build(domain: string, type: DNSRecordType, id: number): Buffer;
}
