import { ClientRequestArgs } from "http";
import * as rxjs from "rxjs";
import { ClientOptions } from "ws";
import { JanusMessage, JanusRequest } from "./types.js";
export declare function createClient(websocketUrl: string, websocketOpts?: ClientOptions | ClientRequestArgs): rxjs.Observable<{
    requestSubject: rxjs.Subject<JanusRequest>;
    send$: rxjs.Observable<never>;
    receive$: rxjs.Observable<JanusMessage>;
    close$: rxjs.Observable<import("ws").default.CloseEvent>;
    close: (code?: number, data?: string | Buffer) => void;
}>;
