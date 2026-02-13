import * as rxjs from "rxjs";
import { JanusMessage, JanusRequest } from "./types.js";
export declare function createPluginHandle(session: {
    requestSubject: rxjs.Subject<JanusRequest>;
    receive$: rxjs.Observable<JanusMessage>;
}, plugin: string): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<Record<string, unknown>>;
    detach(): void;
}>;
