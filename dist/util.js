import * as rxjs from "rxjs";
export function request(requestSubject, message) {
    return new rxjs.Observable(subscriber => requestSubject.next({
        message,
        fulfill(response) {
            subscriber.next(response);
            subscriber.complete();
        },
        reject(err) {
            subscriber.error(err);
        }
    }));
}
