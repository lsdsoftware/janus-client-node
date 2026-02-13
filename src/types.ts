
export type JanusMessage = Record<string, unknown>

export class JanusError {
  constructor(readonly code: number, readonly reason: string) {}
}

export interface JanusRequest {
  readonly message: JanusMessage
  fulfill(response: JanusMessage): void
  reject(err: JanusError): void
}
