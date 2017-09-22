import { Stream } from 'xstream';
import events from './../data/events';
import { DevdayEvent } from './../definitions';
import { makeMeetupsDriver } from './meetups';
import { CHENNAI_ADDRESS, BANGALORE_ADDRESS } from './../data/events';
import dropRepeats from 'xstream/extra/dropRepeats';

export class EventsSource {
  event$: Stream<DevdayEvent>;
  events$: Stream<DevdayEvent[]>;
  constructor(event$: Stream<string>) {
    const xs = Stream;
    this.event$ = event$.map(url => events.filter(event => url === event.url).shift());
    const meetupsEvent$ =
      xs.fromArray(
        events
          .filter(event => !!event.meetup_event_id && !!event.meetup_urlname)
          .filter(event => !!event.form && !!event.form.spreadsheetId)
      );
    const meetup$ = makeMeetupsDriver()(meetupsEvent$).event$;
    const eventsChange$ = meetup$.map(meetup => {
      const event = events.find(event => event.url === meetup.event_url);
      if (event != undefined) event.attending = meetup.yes_rsvp_count;
      return true;
    });
    this.events$ =
      eventsChange$
        .map(() => events)
        .startWith(events);
  }
}

export function makeEventsDriver(): (event$: Stream<string>) => EventsSource {
  function eventsDriver(event$: Stream<string>) {
    return new EventsSource(event$);
  }
  return eventsDriver;
}

export function topEvents(events: DevdayEvent[]): DevdayEvent[] {
  const chennaiEvent =
    events
      .filter(ev => ev.venue === CHENNAI_ADDRESS)
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime())
      .shift();
  const bangaloreEvent =
    events
      .filter(ev => ev.venue === BANGALORE_ADDRESS)
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime())
      .shift();
  return [bangaloreEvent, chennaiEvent];
}

export function moreEvents(events: DevdayEvent[], more: boolean): DevdayEvent[] {
  if (!more)
    return [];
  const topEventsResult = topEvents(events);
  const sortedEvents =
    events
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime());
  return sortedEvents.filter(event => topEventsResult.indexOf(event) === -1);
}

export function getEventsList(events: DevdayEvent[], more: boolean): DevdayEvent[] {
  const sortedEvents = events.sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime());
  return more ? sortedEvents : sortedEvents.filter((x,i) => i < 2);
}

export default makeEventsDriver;
