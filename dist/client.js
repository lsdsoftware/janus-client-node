import { connect } from "@service-broker/websocket";
import assert from "assert";
import * as rxjs from "rxjs";
import { JanusError } from "./types.js";
export function createClient(websocketUrl, websocketOpts) {
    return connect(websocketUrl, websocketOpts, 'janus-protocol').pipe(rxjs.map(conn => {
        const requestSubject = new rxjs.Subject();
        const pendingRequests = new Map();
        return {
            requestSubject,
            send$: requestSubject.pipe(rxjs.concatMap(request => {
                const txId = String(Math.random());
                request.message.transaction = txId;
                return new rxjs.Observable(subscriber => conn.send(JSON.stringify(request.message), err => {
                    if (err) {
                        subscriber.next(new Error('JanusClient sendMessage fail', { cause: err }));
                        subscriber.complete();
                    }
                    else {
                        subscriber.complete();
                        pendingRequests.set(txId, request);
                    }
                }));
            }), rxjs.share()),
            receive$: conn.message$.pipe(rxjs.concatMap(event => {
                try {
                    assert(typeof event.data == 'string');
                    const message = JSON.parse(event.data);
                    if (message.janus == 'event' && typeof message.transaction == 'undefined') {
                        return rxjs.of(message);
                    }
                    else {
                        const request = pendingRequests.get(message.transaction);
                        if (request) {
                            pendingRequests.delete(message.transaction);
                            if (message.janus == 'error') {
                                const { code, reason } = message.error;
                                request.reject(new JanusError(code, reason));
                            }
                            else {
                                request.fulfill(message);
                            }
                            return rxjs.EMPTY;
                        }
                        else {
                            throw new Error('Stray');
                        }
                    }
                }
                catch (err) {
                    if (err instanceof Error)
                        err.cause = event.data;
                    return rxjs.of(new Error('JanusClient processMessage fail', { cause: err }));
                }
            }), rxjs.share()),
            close$: conn.close$,
            close: conn.close.bind(conn)
        };
    }));
}
