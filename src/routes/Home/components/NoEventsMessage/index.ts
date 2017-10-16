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

const messageDom =
  p('.message', [
    "We're ideating the topics and presentations for the next event.",
    br(),
    "If you have an idea, let us know using the form below, or contact us at ",
    a({ attrs: { href: 'mailto:devday.chn@gmail.com' } }, "devday.chn@gmail.com")
  ]);

export const NoEventsMessage = ({ events$ }: Sources): Sinks => {
  const vdom$ =
    events$
      .map(events => events.length)
      .compose(dropRepeats())
      .map(length => length > 0 ? null : messageDom);
  return {
    dom: vdom$,
  };
};
