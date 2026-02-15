import * as rxjs from "rxjs";
import { JanusPluginHandle, JanusSession } from "./types.js";
export declare function createPluginHandle(session: JanusSession, plugin: string): rxjs.Observable<JanusPluginHandle>;
