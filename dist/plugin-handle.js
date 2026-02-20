import { err, ok } from "neverthrow";
import * as rxjs from "rxjs";
import { makeJanusError, request } from "./util.js";
export function createPluginHandle(session, plugin) {
    return request(session.requestSubject, { janus: "attach", plugin }).pipe(rxjs.map(({ data: { id: handleId } }) => {
        const requestSubject = new rxjs.Subject();
        return {
            requestSubject,
            send$: requestSubject.pipe(rxjs.concatMap(request => {
                session.requestSubject.next({
                    message: {
                        janus: "message",
                        handle_id: handleId,
                        body: request.message
                    },
                    stacktrace: request.stacktrace,
                    callback(result) {
                        request.callback(result.andThen(response => {
                            const { data } = response.plugindata;
                            if (data.error) {
                                const { error, error_code } = data;
                                return err(makeJanusError(this, error_code, error));
                            }
                            else {
                                return ok(data);
                            }
                        }));
                    }
                });
                return rxjs.EMPTY;
            }), rxjs.share()),
            receive$: session.receive$.pipe(rxjs.filter(message => message.handle_id == handleId), rxjs.map(message => {
                const { data } = message.plugindata;
                return data;
            }), rxjs.share()),
            detach() {
                session.requestSubject.next({
                    message: { janus: "detach", handle_id: handleId },
                    stacktrace: new Error(),
                    callback(result) {
                        result.orTee(err => console.error('JanusPluginHandle detach fail', handleId, err));
                    }
                });
            }
        };
    }));
}
