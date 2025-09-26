// Infrastructure Layer: Interface for transport
export interface ITransport {
  send(packet: Buffer): Promise<Buffer>;
}
