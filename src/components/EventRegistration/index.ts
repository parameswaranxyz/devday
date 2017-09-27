import { Stream } from 'xstream';
import { DOMSource, VNode, div, i, a } from '@cycle/dom';
import isolate from '@cycle/isolate';
import './styles.scss';

interface Sources {
  dom: DOMSource;
}

interface Sinks {
  dom: Stream<VNode>;
}

const EventRegistrationComponent = ({ dom }: Sources): Sinks => {
  const xs = Stream;
  const vdom$ = xs.of(
    div('.event-registration', [
      a({ attrs: { href: '#' } }, [
        i('.material-icons', ['event_note'])
      ])
    ])
  );
  return {
    dom: vdom$
  }
};

export const EventRegistration: (sources: Sources) => Sinks = sources => isolate(EventRegistrationComponent)(sources);
