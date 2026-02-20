import { connect } from "@service-broker/websocket";
import assert from "assert";
import { err as error, ok } from "neverthrow";
import * as rxjs from "rxjs";
import { makeJanusError } from "./util.js";
export function createClient(websocketUrl, websocketOpts) {
    return connect(websocketUrl, websocketOpts, 'janus-protocol').pipe(rxjs.map((conn) => {
        const requestSubject = new rxjs.Subject();
        const pendingTxs = new Map();
        return {
            requestSubject,
            send$: requestSubject.pipe(rxjs.mergeMap(request => {
                const txId = String(Math.random());
                request.message.transaction = txId;
                return new rxjs.Observable(subscriber => conn.send(JSON.stringify(request.message), err => {
                    subscriber.next(err);
                    subscriber.complete();
                })).pipe(rxjs.exhaustMap(err => {
                    if (err) {
                        request.callback(error(err));
                        return rxjs.EMPTY;
                    }
                    else {
                        function waitResponse(timeout) {
                            return new rxjs.Observable(subscriber => {
                                pendingTxs.set(txId, response => {
                                    subscriber.next(response);
                                    subscriber.complete();
                                });
                                return () => pendingTxs.delete(txId);
                            }).pipe(timeout == Infinity ? rxjs.identity : rxjs.timeout({
                                first: timeout,
                                with: () => rxjs.of({ janus: 'error', error: { code: 408, reason: 'Request timeout' } })
                            }));
                        }
                        return waitResponse(30_000).pipe(rxjs.exhaustMap(response => rxjs.iif(() => response.janus == 'ack', waitResponse(request.timeout ?? 300_000), rxjs.of(response))), rxjs.exhaustMap(response => {
                            if (response.janus == 'error') {
                                const { code, reason } = response.error;
                                request.callback(error(makeJanusError(request, code, reason)));
                            }
                            else {
                                try {
                                    request.callback(ok(response));
                                }
                                catch (err) {
                                    if (err instanceof Error && !err.cause)
                                        err.cause = response;
                                    request.stacktrace.cause = err;
                                    request.stacktrace.message = 'Fail to handle Janus response';
                                    request.callback(error(request.stacktrace));
                                }
                            }
                            return rxjs.EMPTY;
                        }));
                    }
                }));
            }), rxjs.share()),
            receive$: conn.message$.pipe(rxjs.concatMap(event => {
                try {
                    assert(typeof event.data == 'string');
                    const message = JSON.parse(event.data);
                    if (typeof message.transaction == 'undefined') {
                        return rxjs.of(message);
                    }
                    else {
                        const pending = pendingTxs.get(message.transaction);
                        if (pending) {
                            pending(message);
                            return rxjs.EMPTY;
                        }
                        else {
                            throw new Error('Stray');
                        }
                    }
                }
                catch (err) {
                    console.error('JanusClient receive fail', event.data, err);
                    return rxjs.EMPTY;
                }
            }), rxjs.share()),
            close$: conn.close$.pipe(rxjs.tap(() => {
                for (const pending of pendingTxs.values())
                    pending({ janus: 'error', error: { code: 503, reason: 'Connection closed before response was received' } });
            })),
            close: conn.close.bind(conn)
        };
    }));
}
