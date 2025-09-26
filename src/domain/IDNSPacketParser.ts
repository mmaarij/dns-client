// Domain Layer: Interface for DNS packet parser
export type AnswerRecord = [string, string];

export interface IDNSPacketParser {
  parse(data: Buffer): AnswerRecord[];
}
