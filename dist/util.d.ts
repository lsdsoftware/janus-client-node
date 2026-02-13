import * as rxjs from "rxjs";
import { JanusRequest } from "./types.js";
export declare function request<T>(requestSubject: rxjs.Subject<JanusRequest>, message: Record<string, unknown>): rxjs.Observable<T>;
export declare function makeJanusError({ stacktrace, message }: JanusRequest, code: number, reason: string): Error & {
    code: number;
};
