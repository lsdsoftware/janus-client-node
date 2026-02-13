import * as rxjs from "rxjs"
import { JanusRequest } from "./types.js"
import { makeJanusError, request } from "./util.js"

export function createPluginHandle(session: { requestSubject: rxjs.Subject<JanusRequest> }, plugin: string) {
  return request<{ data: { id: number } }>(session.requestSubject, { janus: "attach", plugin }).pipe(
    rxjs.map(({ data: { id: handleId }}) => {
      const requestSubject = new rxjs.Subject<JanusRequest>()
      return {
        requestSubject,
        send$: requestSubject.pipe(
          rxjs.concatMap(request => {
            session.requestSubject.next({
              message: {
                janus: "message",
                handle_id: handleId,
                body: request.message
              },
              stacktrace: request.stacktrace,
              fulfill(response) {
                const { data } = response.plugindata as { data: Record<string, unknown> }
                if (data.error) {
                  const { error, error_code } = data as { error: string, error_code: number }
                  request.reject(makeJanusError(this, error_code, error))
                } else {
                  request.fulfill(data)
                }
              },
              reject(err) {
                request.reject(err)
              }
            })
            return rxjs.EMPTY
          })
        ),
        detach() {
          session.requestSubject.next({
            message: { janus: "detach" },
            stacktrace: new Error(),
            fulfill: rxjs.noop,
            reject: err => console.error('JanusPluginHandle detach fail', handleId, err)
          })
        }
      }
    })
  )
}
