import * as rxjs from "rxjs";
import ws from "ws";
export interface JanusRequest {
    readonly message: Record<string, unknown>;
    readonly timeout?: number;
    readonly stacktrace: Error;
    fulfill(response: Record<string, unknown>): void;
    reject(err: Error): void;
}
export interface JanusClient {
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<Record<string, unknown>>;
    close$: rxjs.Observable<ws.CloseEvent>;
    close: ws['close'];
}
export interface JanusSession {
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<Record<string, unknown>>;
    keepAlive$: rxjs.Observable<Error>;
    destroy(): void;
}
export interface JanusPluginHandle {
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<Record<string, unknown>>;
    detach(): void;
}
