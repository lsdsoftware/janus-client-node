import * as rxjs from "rxjs"
import { JanusError, JanusRequest } from "./types.js"
import { request } from "./util.js"

export function createSession(client: { requestSubject: rxjs.Subject<JanusRequest> }, { keepAliveInterval = 45_000 }: {
  keepAliveInterval?: number
} = {}) {
  return request<{ data: { id: number } }>(client.requestSubject, { janus: 'create' }).pipe(
    rxjs.map(({ data: { id: sessionId } }) => {
      const requestSubject = new rxjs.Subject<JanusRequest>()
      return {
        requestSubject,
        send$: requestSubject.pipe(
          rxjs.concatMap(request => {
            request.message.session_id = sessionId
            client.requestSubject.next(request)
            return rxjs.EMPTY
          })
        ),
        keepAlive$: requestSubject.pipe(
          rxjs.switchMap(() =>
            rxjs.interval(keepAliveInterval).pipe(
              rxjs.switchMap(() =>
                new rxjs.Observable<JanusError>(subscriber =>
                  client.requestSubject.next({
                    message: { janus: "keepalive", session_id: sessionId },
                    stacktrace: new Error(),
                    fulfill() {
                      subscriber.complete()
                    },
                    reject(err) {
                      subscriber.next(err)
                      subscriber.complete()
                    }
                  })
                )
              )
            )
          )
        ),
        destroy() {
          client.requestSubject.next({
            message: { janus: 'destroy' },
            stacktrace: new Error(),
            fulfill: rxjs.noop,
            reject: err => console.error('JanusSession destroy fail', sessionId, err)
          })
        }
      }
    })
  )
}
