import { ClientRequestArgs } from "http";
import * as rxjs from "rxjs";
import { ClientOptions } from "ws";
import { JanusClient } from "./types.js";
export declare function createClient(websocketUrl: string, websocketOpts?: ClientOptions | ClientRequestArgs): rxjs.Observable<JanusClient>;
