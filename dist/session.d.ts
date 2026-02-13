import * as rxjs from "rxjs";
import { JanusRequest } from "./types.js";
export declare function createSession(client: {
    requestSubject: rxjs.Subject<JanusRequest>;
    receive$: rxjs.Observable<Record<string, unknown>>;
}, { keepAliveInterval }?: {
    keepAliveInterval?: number;
}): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<Record<string, unknown>>;
    keepAlive$: rxjs.Observable<Error>;
    destroy(): void;
}>;
