
export type JanusMessage = Record<string, unknown>

export type JanusError = Error & { code: number }

export interface JanusRequest {
  readonly message: JanusMessage
  readonly stacktrace: Error
  fulfill(response: JanusMessage): void
  reject(err: JanusError): void
}
