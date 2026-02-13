import * as rxjs from "rxjs";
import { JanusMessage, JanusRequest } from "./types.js";
export declare function request<T extends JanusMessage>(requestSubject: rxjs.Subject<JanusRequest>, message: JanusMessage): rxjs.Observable<T>;
