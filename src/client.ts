import { connect } from "@service-broker/websocket"
import assert from "assert"
import { ClientRequestArgs } from "http"
import * as rxjs from "rxjs"
import { ClientOptions } from "ws"
import { JanusMessage, JanusRequest } from "./types.js"
import { makeJanusError } from "./util.js"

export function createClient(websocketUrl: string, websocketOpts?: ClientOptions | ClientRequestArgs) {
  return connect(websocketUrl, websocketOpts, 'janus-protocol').pipe(
    rxjs.map(conn => {
      const requestSubject = new rxjs.Subject<JanusRequest>()
      const pendingTxs = new Map<unknown, (response: JanusMessage) => void>()
      return {
        requestSubject,
        send$: requestSubject.pipe(
          rxjs.concatMap(request => {
            const txId = String(Math.random())
            request.message.transaction = txId
            conn.send(JSON.stringify(request.message), err => {
              if (err) {
                request.reject(err)
              } else {
                pendingTxs.set(txId, response => {
                  pendingTxs.delete(txId)
                  if (response.janus == 'error') {
                    const { code, reason } = response.error as { code: number, reason: string }
                    request.reject(makeJanusError(request, code, reason))
                  } else {
                    request.fulfill(response)
                  }
                })
              }
            })
            return rxjs.EMPTY
          }),
          rxjs.share()
        ),
        receive$: conn.message$.pipe(
          rxjs.concatMap(event => {
            try {
              assert(typeof event.data == 'string')
              const message = JSON.parse(event.data) as JanusMessage
              if (message.janus == 'event' && typeof message.transaction == 'undefined') {
                return rxjs.of(message)
              } else {
                const pending = pendingTxs.get(message.transaction)
                if (pending) {
                  pending(message)
                  return rxjs.EMPTY
                } else {
                  throw new Error('Stray')
                }
              }
            } catch (err) {
              console.error('JanusClient receive fail', event.data, err)
              return rxjs.EMPTY
            }
          }),
          rxjs.share()
        ),
        close$: conn.close$,
        close: conn.close.bind(conn)
      }
    })
  )
}
