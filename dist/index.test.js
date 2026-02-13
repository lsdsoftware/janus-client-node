import { afterEverything, describe, expect, Expectation } from "@service-broker/test-utils";
import assert from "assert";
import * as rxjs from "rxjs";
import { createClient, createPluginHandle, createSession, request } from "./index.js";
const requestSubject = new rxjs.ReplaySubject();
const shutdownSubject = new rxjs.Subject();
assert(process.env.JANUS_URL, 'Missing env JANUS_URL');
createClient(process.env.JANUS_URL).pipe(rxjs.tap(() => console.info('JanusClient connected')), 
//rxjs.retry({ delay: 15_000 }),
//rxjs.repeat({ delay: 1_000 }),
rxjs.exhaustMap(client => rxjs.merge(client.send$, client.receive$, createSession(client).pipe(rxjs.tap(() => console.info('JanusSession created')), rxjs.exhaustMap(session => rxjs.merge(session.send$, session.keepAlive$, createPluginHandle(session, 'janus.plugin.videoroom').pipe(rxjs.tap(() => console.info('JanusPluginHandle attached')), rxjs.exhaustMap(handle => rxjs.merge(handle.send$, requestSubject.pipe(rxjs.concatMap(request => {
    handle.requestSubject.next(request);
    return rxjs.EMPTY;
}))).pipe(rxjs.finalize(() => handle.detach()))))).pipe(rxjs.finalize(() => session.destroy()))))).pipe(rxjs.takeUntil(client.close$), rxjs.finalize(() => client.close()))), rxjs.takeUntil(shutdownSubject)).subscribe({
    next(event) {
        if (event instanceof Error)
            console.error(event);
        else
            console.info('Unhandled', event);
    },
    error(err) {
        console.error('FATAL', err);
    }
});
afterEverything(() => shutdownSubject.next());
function req(message) {
    return rxjs.firstValueFrom(request(requestSubject, message));
}
describe('main', ({ test }) => {
    test('first', async () => {
        const result = await req({ request: 'list' });
        expect(result, {
            videoroom: 'success',
            list: new Expectation('is', 'array', actual => assert(Array.isArray(actual)))
        });
    });
});
