import assert from 'node:assert/strict'
import {test, mock} from 'node:test'
import {Subject, of, firstValueFrom} from 'rxjs'

let connection
mock.module('@service-broker/websocket', {namedExports: {connect: () => of(connection)}})
const {createClient} = await import('../dist/index.js')

async function withClient(replies, check) {
  const messages = new Subject()
  connection = {
    message$: messages, close$: new Subject(), close() {},
    send(text, callback) {
      const {transaction} = JSON.parse(text)
      callback()
      // Separate turns reproduce Janus ACK followed by its asynchronous result.
      let index = 0
      const next = () => {
        if (index === replies.length) return
        messages.next({data: JSON.stringify({...replies[index++], transaction})})
        setImmediate(next)
      }
      setImmediate(next)
    }
  }
  const client = await firstValueFrom(createClient('ws://mock'))
  const send = client.send$.subscribe()
  const receive = client.receive$.subscribe()
  try {
    const result = await new Promise(resolve => client.requestSubject.next({
      message: {janus: 'message'}, timeout: 50, stacktrace: new Error(), callback: resolve
    }))
    check(result)
  } finally {send.unsubscribe(); receive.unsubscribe()}
}

test('Janus ACK cleanup preserves the handler for the subsequent plugin response', async () => {
  const response = {janus: 'event', plugindata: {data: {videoroom: 'joined'}}}
  await withClient([{janus: 'ack'}, response], result => {
    assert.equal(result.isOk(), true, result.isErr() ? result.error.message : '')
    assert.deepEqual(result.value.plugindata, response.plugindata)
  })
})
test('Janus synchronous responses still complete without an ACK', async () => {
  await withClient([{janus: 'success', data: {id: 123}}], result => {
    assert.equal(result.isOk(), true)
    assert.equal(result.value.data.id, 123)
  })
})
test('Janus errors after an ACK reach the caller instead of timing out', async () => {
  await withClient([{janus: 'ack'}, {janus: 'error', error: {code: 426, reason: 'No such room'}}], result => {
    assert.equal(result.isErr(), true)
    assert.equal(result.error.code, 426)
  })
})
test('Janus ACK without a final response still times out', async () => {
  await withClient([{janus: 'ack'}], result => {
    assert.equal(result.isErr(), true)
    assert.equal(result.error.code, 408)
  })
})
