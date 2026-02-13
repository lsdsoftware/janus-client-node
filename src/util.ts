import * as rxjs from "rxjs"
import { JanusRequest } from "./types.js"

export function request<T>(
  requestSubject: rxjs.Subject<JanusRequest>,
  message: Record<string, unknown>
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

export function makeJanusError({ stacktrace, message }: JanusRequest, code: number, reason: string) {
  stacktrace.name = 'JanusError'
  stacktrace.cause = message
  stacktrace.message = reason
  return Object.assign(stacktrace, { code })
}
