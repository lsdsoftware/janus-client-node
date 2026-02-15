import { afterEverything, describe, expect, Expectation } from "@service-broker/test-utils";
import assert from "assert";
import * as rxjs from "rxjs";
import { createClient, createPluginHandle, createSession, request } from "./index.js";
const shutdownSubject = new rxjs.Subject();
createClient('wss://janus.conf.meetecho.com/ws').pipe(rxjs.tap({
    next: () => console.info('JanusClient connected'),
    error: err => console.error('JanusClient connect fail', err)
}), rxjs.retry({ delay: 15_000 }), rxjs.exhaustMap(client => rxjs.merge(client.send$, client.receive$, createSession(client).pipe(rxjs.tap({
    next: () => console.info('JanusSession created'),
    error: err => console.error('JanusSession create fail', err)
}), rxjs.exhaustMap(session => rxjs.merge(session.send$, session.receive$, session.keepAlive$, createPluginHandle(session, 'janus.plugin.videoroom').pipe(rxjs.tap({
    next: () => console.info('JanusPluginHandle attached'),
    error: err => console.error('JanusPluginHandle attach fail', err)
}), rxjs.exhaustMap(handle => rxjs.merge(handle.send$, handle.receive$, runTests(handle)).pipe(rxjs.finalize(() => handle.detach()))))).pipe(rxjs.finalize(() => session.destroy()))))).pipe(rxjs.takeUntil(client.close$), rxjs.finalize(() => client.close()))), rxjs.takeUntil(shutdownSubject)).subscribe({
    error: err => console.error('FATAL', err)
});
function runTests(handle) {
    const req = (message) => rxjs.firstValueFrom(request(handle.requestSubject, message));
    describe('main', ({ test }) => {
        test('first', async () => {
            const result = await req({ request: 'list' });
            expect(result, {
                videoroom: 'success',
                list: new Expectation('is', 'array', actual => assert(Array.isArray(actual)))
            });
        });
    });
    afterEverything(() => shutdownSubject.next());
    return rxjs.EMPTY;
}
