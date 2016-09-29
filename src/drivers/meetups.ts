import xs, { Stream, Producer, Listener } from 'xstream';
import { HTTPSource, RequestOptions, Response, makeHTTPDriver } from '@cycle/http';
import XStreamAdapter from '@cycle/xstream-adapter';
import { DevdayEvent, MeetupEvent } from './../definitions';

const MEETUP_EVENT_URL = '/attendees?meetup_url=:urlname&meetup_event_id=:id&event_url=:eventUrl&spreadsheetData=:spreadsheetData';

export class MeetupsSource {
  event$: Stream<MeetupEvent>;
  constructor(meetupRequest$: Stream<DevdayEvent>) {
    const request$ =
      meetupRequest$
        .map(event => {
          const requestOptions: RequestOptions = {
            url: MEETUP_EVENT_URL
              .replace(':urlname', event.meetup_urlname)
              .replace(':id', event.meetup_event_id)
              .replace(':eventUrl', event.url)
              .replace(':spreadsheetData', JSON.stringify(event.form)),
            category: 'meetups'
          };
          return requestOptions;
        });
    const http: HTTPSource = makeHTTPDriver()(request$, XStreamAdapter);
    const response$$: Stream<Stream<Response>> = http.select('meetups');
    this.event$ =
      response$$
        .flatten()
        .map(response => {
          return {
            event_url: response.body['event_url'],
            yes_rsvp_count: response.body['yes_rsvp_count']
          };
        });
  }
}

export function makeMeetupsDriver() {
  function meetupsDriver(meetupRequest$: Stream<DevdayEvent>) {
    return new MeetupsSource(meetupRequest$);
  }
  return meetupsDriver;
}
