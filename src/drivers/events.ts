import { Stream } from 'xstream';
import events from './../data/events';
import { DevdayEvent } from './../definitions';
import { makeMeetupsDriver, MeetupsSource } from './../drivers/meetups';

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
        )
      );
    const meetups: MeetupsSource = makeMeetupsDriver()(meetupsEvent$);
    const meetups$ = meetups.event$;
    meetups$.map(meetup => {
      const index = events.findIndex(event => event.meetup_event_id === meetup.id);
      if (index === -1)
        return;
      events[index].attending = meetup.yes_rsvp_count;
    });
    this.events$ =
      xs.merge(
        event$,
        meetups$
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

export default makeEventsDriver;
