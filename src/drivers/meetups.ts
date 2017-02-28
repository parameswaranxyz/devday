import xs, { Stream, Producer, Listener } from 'xstream';
import { HTTPSource, RequestOptions, Response, makeHTTPDriver } from '@cycle/http';
import { DevdayEvent, MeetupEvent } from './../definitions';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';

const MEETUP_EVENT_URL = '/attendees/:eventUrl?meetup_url=:urlname&meetup_event_id=:id&spreadsheetData=:spreadsheetData';

export class MeetupsSource {
  event$: Stream<MeetupEvent>;
  constructor(meetupRequest$: Stream<DevdayEvent>) {
    const request$ =
      meetupRequest$
        .debug()
        .map(event => {
          const requestOptions: RequestOptions = {
            url: MEETUP_EVENT_URL
              .replace(':urlname', event.meetup_urlname)
              .replace(':id', event.meetup_event_id)
              .replace(':eventUrl', event.url)
              .replace(':spreadsheetData', JSON.stringify(event.form)),
            category: 'meetups',
            lazy: true
          };
          return requestOptions;
        });
    const http: HTTPSource = makeHTTPDriver()(request$, 'meetupsHttp');
    const response$$: Stream<Stream<Response>> = http.select('meetups');
    this.event$ =
      response$$
        .map(response$ => response$.replaceError(() =>
          xs.of<Response>({ body: { 'event_url': undefined, 'yes_rsvp_count': 0} })))
        .compose(flattenConcurrently)
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
