export type JanusMessage = Record<string, unknown>;
export interface JanusRequest {
    readonly message: JanusMessage;
    readonly stacktrace: Error;
    fulfill(response: JanusMessage): void;
    reject(err: Error): void;
}
