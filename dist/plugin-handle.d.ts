import * as rxjs from "rxjs";
import { JanusRequest } from "./types.js";
export declare function createPluginHandle(session: {
    requestSubject: rxjs.Subject<JanusRequest>;
}, plugin: string): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    detach(): void;
}>;
