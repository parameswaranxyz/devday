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
  upcoming$: Stream<DevdayEvent[]>;
  archive$: Stream<DevdayEvent[]>;
  constructor(event$: Stream<string>) {
    const xs = Stream;
    const now = new Date();
    const events$ = xs.of(sortByStartTime(events)).compose(delay(300));
    this.event$ = event$.map(url => events.filter(event => url === event.url).shift());
    this.events$ = events$;
    this.upcoming$ = events$.map(events => events.filter(({ event_time: { end_time } }) => end_time > now).reverse());
    this.archive$ = events$.map(events => events.filter(({ event_time: { end_time } }) => end_time <= now));
  }
}

export function makeEventsDriver(): (event$: Stream<string>) => EventsSource {
  function eventsDriver(event$: Stream<string>) {
    return new EventsSource(event$);
  }
  return eventsDriver;
}

export default makeEventsDriver;
