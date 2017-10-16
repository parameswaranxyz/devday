import { Stream } from 'xstream';
import { VNode, p, br, a } from '@cycle/dom';
import { DevdayEvent } from '../../../../definitions';
import dropRepeats from 'xstream/extra/dropRepeats';

interface Sources {
  events$: Stream<DevdayEvent[]>;
}

interface Sinks {
  dom: Stream<VNode>;
}

export const NoEventsMessage = ({ events$ }: Sources): Sinks => {
  const vdom$ =
    events$
      .map(events => events.length)
      .compose(dropRepeats())
      .filter(length => length === 0)
      .mapTo(
        p('.message', [
          "We're ideating the topics and presentations for the next event.",
          br(),
          "If you have an idea, let us know using the form below, or contact us at ",
          a({ attrs: { href: 'mailto:devday.chn@gmail.com' } }, "devday.chn@gmail.com")
        ])
      ).startWith(null);
  return {
    dom: vdom$,
  };
};
