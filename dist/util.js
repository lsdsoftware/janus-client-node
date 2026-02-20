import * as rxjs from "rxjs";
export function request(requestSubject, message, { timeout } = {}) {
    const stacktrace = new Error();
    return new rxjs.Observable(subscriber => requestSubject.next({
        message,
        timeout,
        stacktrace,
        callback(result) {
            result.match(response => {
                subscriber.next(response);
                subscriber.complete();
            }, err => {
                subscriber.error(err);
            });
        }
    }));
}
export function makeJanusError({ stacktrace, message }, code, reason) {
    stacktrace.name = 'JanusError';
    stacktrace.cause = message;
    stacktrace.message = reason;
    return Object.assign(stacktrace, { code });
}
