export interface JanusRequest {
    readonly message: Record<string, unknown>;
    readonly timeout?: number;
    readonly stacktrace: Error;
    fulfill(response: Record<string, unknown>): void;
    reject(err: Error): void;
}
