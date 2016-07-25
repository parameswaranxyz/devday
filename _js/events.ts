import { Stream } from 'xstream';
import { DevdayEvent } from './definitions';

const events: DevdayEvent[] = [];

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
        .filter(url => url !== 'archive')
        .map(url =>
          xs.fromArray(events)
            .filter(event => url === event.url))
        .flatten();
    this.events$ =
      event$.filter(url => url === 'archive')
        .mapTo(events);
  }
}

export function makeEventsDriver(): (event$: Stream<string>) => EventsSource {
  function eventsDriver(event$: Stream<string>) {
    return new EventsSource(event$);
  }
  return eventsDriver;
}

export default makeEventsDriver;
