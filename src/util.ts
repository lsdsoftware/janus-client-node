import * as rxjs from "rxjs"
import { JanusMessage, JanusRequest } from "./types.js"

export function request<T extends JanusMessage>(
  requestSubject: rxjs.Subject<JanusRequest>,
  message: JanusMessage
) {
  return new rxjs.Observable<T>(subscriber =>
    requestSubject.next({
      message,
      fulfill(response) {
        subscriber.next(response as T)
        subscriber.complete()
      },
      reject(err) {
        subscriber.error(err)
      }
    })
  )
}
