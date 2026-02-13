import * as rxjs from "rxjs";
import { JanusError, JanusMessage, JanusRequest } from "./types.js";
export declare function request<T extends JanusMessage>(requestSubject: rxjs.Subject<JanusRequest>, message: JanusMessage): rxjs.Observable<T>;
export declare function makeJanusError({ stacktrace, message }: JanusRequest, code: number, reason: string): JanusError;
