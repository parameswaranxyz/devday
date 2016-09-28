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
    event$.addListener({
      next: () => { },
      error: () => { },
      complete: () => { }
    });
    this.event$ =
      event$
        .map(url =>
          events
            .filter(event => url === event.url)
            .shift());
    const meetupsEvent$ =
      xs.fromArray(
        events.filter(event =>
          event.meetup_event_id != undefined
          && event.meetup_urlname != undefined
          && event.event_time.start_time.getTime() > new Date().getTime()
        )
      ).compose<DevdayEvent>(
        dropRepeats<DevdayEvent>((x,y) => x.url === y.url)
      ).debug();
    const meetups = makeMeetupsDriver()(meetupsEvent$);
    const meetup$ = meetups.event$;
    meetup$.map(meetup => {
      const index = events.findIndex(event => event.url === meetup.event_url);
      if (index === -1)
        return;
      events[index].attending = meetup.yes_rsvp_count;
    });
    this.events$ =
      xs.merge(
        event$,
        meetup$
      )
        .mapTo(events)
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

export default makeEventsDriver;
