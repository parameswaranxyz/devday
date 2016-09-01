import xs, { Stream, Producer, Listener } from 'xstream';
import { HTTPSource, RequestOptions, Response, makeHTTPDriver } from '@cycle/http';
import XStreamAdapter from '@cycle/xstream-adapter';
import { DevdayEvent, DevdayRegistrationData } from './../definitions';
import { VNode, div, input, label } from '@cycle/dom';

export interface RegistrationResult {
  event_url: string;
  success: boolean;
}

export interface RegistrationRequest {
  event: DevdayEvent;
  data: DevdayRegistrationData;
}

export class RegistrationsSource {
  registration$: Stream<RegistrationResult>;
  constructor(registration$: Stream<RegistrationRequest>) {
    const request$ = registration$.map(req => register(req.event, req.data));
    request$.map(request => $.ajax({
      url: request.url,
      data: request.send,
      type: request.type,
      dataType: 'xml',
      crossDomain: true,
      statusCode: {
        0: () => this.registration$.shamefullySendNext({
          event_url: (<any>request.send).event_url,
          success: true
        } as RegistrationResult),
        200: () => this.registration$.shamefullySendNext({
          event_url: (<any>request.send).event_url,
          success: true
        } as RegistrationResult),
      }
    }));
    const http: HTTPSource = makeHTTPDriver()(request$, XStreamAdapter);
    const response$$: Stream<Stream<Response>> = http.select('registrations');
    this.registration$ =
      response$$
        .map(response$ => response$.replaceError(error => xs.of<Response>(null)))
        .flatten()
        .filter(Boolean)
        .map(response => ({
          event_url: response.request.category,
          success: response.status === 200
        } as RegistrationResult))
        .remember();
  }
}

export function makeRegistrationsDriver() {
  function registrationsDriver(registration$: Stream<RegistrationRequest>) {
    return new RegistrationsSource(registration$);
  }
  return registrationsDriver;
}


function register(event: DevdayEvent, data: DevdayRegistrationData): RequestOptions {
  const form = event.form;
  if (form == undefined)
    return null;
  const payload = {
    event_url: event.url
  };
  payload[form.name] = data.name;
  payload[form.email] = data.email;
  payload[form.mobile] = data.mobile;
  if (data.type != undefined)
    payload[form.type] = data.type;
  if (data.title != undefined)
    payload[form.title] = data.title;
  if (data.abstract != undefined)
    payload[form.abstract] = data.abstract;
  return {
    url: form.url,
    method: 'POST',
    send: payload,
    category: 'registrations',
    type: 'application/x-www-form-urlencoded',
    headers: {
      'Upgrade-Insecure-Requests': '1'
    }
  };
}
