import xs, { Stream, Producer, Listener } from 'xstream';
import { HTTPSource, RequestOptions, Response, makeHTTPDriver } from '@cycle/http';
import { DevdayEvent, DevdayRegistrationData } from './../definitions';
import { VNode, div, input, label } from '@cycle/dom';
declare const API_ENDPOINT: string;

export interface TalksResult {
  success: boolean;
}

const toRequestOptions = (data: DevdayRegistrationData): RequestOptions => ({
  url: API_ENDPOINT + 'talks',
  method: 'POST',
  send: data,
  category: 'talks',
  type: 'application/x-www-form-urlencoded; charset=UTF-8'
});

export class TalksSource {
  talk$: Stream<TalksResult>;
  constructor(registration$: Stream<DevdayRegistrationData>) {
    const request$ = registration$.map(req => toRequestOptions(req));
    const http: HTTPSource = makeHTTPDriver()(request$, 'talksHttp');
    const response$$: Stream<Stream<Response>> = http.select('talks');
    this.talk$ =
      response$$
        .map(response$ => response$.replaceError(error => xs.of({ status: 500 } as Response)))
        .flatten()
        .map<TalksResult>(response => ({ success: response.status === 200 }))
        .remember();
  }
}

export const makeTalksDriver = () => (registration$: Stream<DevdayRegistrationData>) => new TalksSource(registration$);
