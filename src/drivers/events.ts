import { Stream } from 'xstream';
import events from './../data/events';
import { DevdayEvent } from './../definitions';
import { makeMeetupsDriver } from './meetups';
import { CHENNAI_ADDRESS, BANGALORE_ADDRESS } from './../data/events';
import dropRepeats from 'xstream/extra/dropRepeats';
import delay from 'xstream/extra/delay';

const getStartTime = (event: DevdayEvent): number => event.event_time.start_time.getTime();
const byStartTime = (a: DevdayEvent, b: DevdayEvent) => getStartTime(b) - getStartTime(a);
const sortByStartTime = (events: DevdayEvent[]) => events.sort(byStartTime);

export class EventsSource {
  event$: Stream<DevdayEvent>;
  events$: Stream<DevdayEvent[]>;
  main$: Stream<DevdayEvent[]>;
  archive$: Stream<DevdayEvent[]>;
  constructor(event$: Stream<string>) {
    const xs = Stream;
    const events$ = xs.of(sortByStartTime(events)).compose(delay(300));
    this.event$ = event$.map(url => events.filter(event => url === event.url).shift());
    this.events$ = events$;
    this.main$ = events$.map(events => events.slice(0, 2));
    this.archive$ = events$.map(events => events.slice(2));
  }
}

export function makeEventsDriver(): (event$: Stream<string>) => EventsSource {
  function eventsDriver(event$: Stream<string>) {
    return new EventsSource(event$);
  }
  return eventsDriver;
}

export default makeEventsDriver;
