import * as rxjs from "rxjs";
import { request } from "./util.js";
export function createSession(client, { keepAliveInterval = 45_000 } = {}) {
    return request(client.requestSubject, { janus: 'create' }).pipe(rxjs.map(({ data: { id: sessionId } }) => {
        const requestSubject = new rxjs.Subject();
        return {
            requestSubject,
            send$: requestSubject.pipe(rxjs.concatMap(request => {
                request.message.session_id = sessionId;
                client.requestSubject.next(request);
                return rxjs.EMPTY;
            }), rxjs.share()),
            receive$: client.receive$.pipe(rxjs.filter(message => message.session_id == sessionId), rxjs.share()),
            keepAlive$: requestSubject.pipe(rxjs.switchMap(() => rxjs.interval(keepAliveInterval).pipe(rxjs.switchMap(() => new rxjs.Observable(subscriber => client.requestSubject.next({
                message: { janus: "keepalive", session_id: sessionId },
                stacktrace: new Error(),
                fulfill() {
                    subscriber.complete();
                },
                reject(err) {
                    subscriber.next(err);
                    subscriber.complete();
                }
            }))))), rxjs.share()),
            destroy() {
                client.requestSubject.next({
                    message: { janus: 'destroy' },
                    stacktrace: new Error(),
                    fulfill: rxjs.noop,
                    reject: err => console.error('JanusSession destroy fail', sessionId, err)
                });
            }
        };
    }));
}
