import * as rxjs from "rxjs";
import { JanusError } from "./types.js";
import { request } from "./util.js";
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
                    fulfill(response) {
                        const { data } = response.plugindata;
                        if (data.error) {
                            const { error, error_code } = data;
                            request.reject(new JanusError(error_code, error));
                        }
                        else {
                            request.fulfill(data);
                        }
                    },
                    reject(err) {
                        request.reject(err);
                    }
                });
                return rxjs.EMPTY;
            })),
            detach() {
                session.requestSubject.next({
                    message: { janus: "detach" },
                    fulfill: rxjs.noop,
                    reject: err => console.error('JanusPluginHandle detach fail', handleId, err)
                });
            }
        };
    }));
}
