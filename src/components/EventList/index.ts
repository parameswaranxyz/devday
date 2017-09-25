import { Stream } from 'xstream';
import { Event } from '../Event';
import { VNode, DOMSource } from '@cycle/dom';
import { DevdayEvent } from '../../definitions';
import isolate from '@cycle/isolate';

interface Sources {
  dom: DOMSource;
  events$: Stream<DevdayEvent[]>;
}

interface Sinks {
  dom: Stream<VNode[]>;
  history: Stream<string>;
}

const EventListComponent = ({ dom, events$ }: Sources): Sinks => {
  const xs = Stream;
  const eventComponents$ = events$.map(events => events.map(event => Event({ dom, event$: xs.of(event) })));
  const navigateTo$ =
    eventComponents$
      .map(sinks => sinks.map(s => s.history))
      .map(histories => xs.merge(...histories) as Stream<string>)
      .flatten();
  const eventDoms$ =
    eventComponents$
      .map(sinks => sinks.map(s => s.dom))
      .map<Stream<VNode[]>>(dom$s => xs.combine(...dom$s))
      .flatten();
  return {
    dom: eventDoms$,
    history: navigateTo$
  };
}

export const EventList: (sources: Sources) => Sinks = sources => isolate(EventListComponent)(sources);
