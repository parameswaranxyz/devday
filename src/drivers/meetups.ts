import { Stream, Producer, Listener } from 'xstream';
import { HTTPSource, RequestOptions, Response, makeHTTPDriver } from '@cycle/http';
import { StreamAdapter } from '@cycle/base';
import XStreamAdapter from '@cycle/xstream-adapter';
import { DevdayEvent } from './../definitions';

export interface MeetupEvent {
  name: string;
  yes_rsvp_count: number;
}

const MEETUP_EVENT_URL = 'https://api.meetup.com/:urlname/events/:id?&sign=true&photo-host=public';

export class MeetupsSource {
  event$: Stream<MeetupEvent>;
  constructor(meetupRequest$: Stream<DevdayEvent>) {
    const xs = Stream;
    const request$ =
      meetupRequest$
        .map(event => {
          const requestOptions: RequestOptions = {
            url: MEETUP_EVENT_URL
              .replace(':urlname', event.meetup_urlname)
              .replace(':id', event.meetup_event_id.toString()),
            category: 'meetups',
          };
          return requestOptions;
        });
    const http: HTTPSource = makeHTTPDriver()(request$, XStreamAdapter);
    const response$$: Stream<Stream<Response>> = http.select('meetups');
    this.event$ =
      response$$
        .flatten()
        .filter(Boolean)
        .map(response => JSON.parse(response.text) as MeetupEvent)
        .remember();
  }
}

export function makeMeetupsDriver() {
  function meetupsDriver(meetupRequest$: Stream<DevdayEvent>) {
    return new MeetupsSource(meetupRequest$);
  }
  return meetupsDriver;
}
