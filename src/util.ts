import * as rxjs from "rxjs"
import { JanusError, JanusMessage, JanusRequest } from "./types.js"

export function request<T extends JanusMessage>(
  requestSubject: rxjs.Subject<JanusRequest>,
  message: JanusMessage
) {
  const stacktrace = new Error()
  return new rxjs.Observable<T>(subscriber =>
    requestSubject.next({
      message,
      stacktrace,
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

export function makeJanusError({ stacktrace, message }: JanusRequest, code: number, reason: string): JanusError {
  stacktrace.name = 'JanusError'
  stacktrace.cause = message
  stacktrace.message = reason
  return Object.assign(stacktrace, { code })
}
