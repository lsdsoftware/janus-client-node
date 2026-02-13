import * as rxjs from "rxjs";
import { JanusMessage, JanusRequest } from "./types.js";
export declare function createSession(client: {
    requestSubject: rxjs.Subject<JanusRequest>;
    receive$: rxjs.Observable<JanusMessage>;
}, { keepAliveInterval }?: {
    keepAliveInterval?: number;
}): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<JanusMessage>;
    keepAlive$: rxjs.Observable<Error>;
    destroy(): void;
}>;
