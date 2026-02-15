import * as rxjs from "rxjs";
import { JanusClient, JanusSession } from "./types.js";
export declare function createSession(client: JanusClient, { keepAliveInterval }?: {
    keepAliveInterval?: number;
}): rxjs.Observable<JanusSession>;
