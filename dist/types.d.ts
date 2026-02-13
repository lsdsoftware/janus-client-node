export type JanusMessage = Record<string, unknown>;
export declare class JanusError {
    readonly code: number;
    readonly reason: string;
    constructor(code: number, reason: string);
}
export interface JanusRequest {
    readonly message: JanusMessage;
    fulfill(response: JanusMessage): void;
    reject(err: JanusError): void;
}
