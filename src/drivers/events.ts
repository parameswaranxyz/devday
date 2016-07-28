import { Stream } from 'xstream';
import events from './../data/events';
import { DevdayEvent } from './../definitions';

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
    this.events$ =
      event$
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
