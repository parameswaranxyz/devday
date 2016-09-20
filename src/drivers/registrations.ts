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
    const http: HTTPSource = makeHTTPDriver()(request$, XStreamAdapter);
    const response$$: Stream<Stream<Response>> = http.select('registrations');
    this.registration$ =
      response$$
        .map(response$ => response$.replaceError(error => xs.of<Response>(null)))
        .flatten()
        .filter(Boolean)
        .map(response => ({
          event_url: (<any>response.request.send).event_url,
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
    name : data.name,
    email : data.email,
    mobile : data.mobile,
    spreadsheetId : form.spreadsheetId,
    sheetName : form.sheetName,
    event_url: event.url,
    present : data.present,
    title : data.title,
    abstract : data.abstract
  };

  return {
    url: '/register',
    method: 'POST',
    send: payload,
    category: 'registrations',
    type: 'application/x-www-form-urlencoded; charset=UTF-8'
  };
}
