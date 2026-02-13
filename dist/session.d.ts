import * as rxjs from "rxjs";
import { JanusError, JanusRequest } from "./types.js";
export declare function createSession(client: {
    requestSubject: rxjs.Subject<JanusRequest>;
}, { keepAliveInterval }?: {
    keepAliveInterval?: number;
}): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    keepAlive$: rxjs.Observable<JanusError>;
    destroy(): void;
}>;
