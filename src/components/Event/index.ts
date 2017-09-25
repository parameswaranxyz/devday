import { Stream } from 'xstream';
import { div, article, h2, h3, button, p, VNode, DOMSource } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { DevdayEvent} from '../../definitions';
import sampleCombine from 'xstream/extra/sampleCombine';
import * as moment from 'moment';
import * as marked from 'marked';
import './styles.scss';

interface Sources {
  dom: DOMSource;
  event$: Stream<DevdayEvent>;
}

interface Sinks {
  dom: Stream<VNode>;
  history: Stream<string>;
}

const fadeInOutStyle = {
  opacity: '0', delayed: {opacity: '1'}, remove: {opacity: '0'}
};

const EventComponent = ({ dom, event$ }: Sources): Sinks => {
  const viewDetailsClick$ = dom.select('.action').events('click', { preventDefault: true });
  const navigateTo$ =
    viewDetailsClick$.compose(sampleCombine(event$))
      .map(([_, { meetup_event_id, meetup_urlname }]) =>
        `https://meetup.com/${meetup_urlname}/events/${meetup_event_id}`
      );
  const vtree$ = event$.map(({ title, event_time: { start_time }, abstract, venue: { city }, image_url, url, meetup_event_id, meetup_urlname }) =>
    article('.event', { style: fadeInOutStyle, key: url }, [
      div('.media', { style: { delayed: { 'background-image': `url("${image_url}")` } } }, [
        div('.overlay', { style: fadeInOutStyle }, [city])
      ]),
      div('.content', [
        div('.header', [
          h2('.title', { attrs: { title: title }, style: fadeInOutStyle }, [ title ]),
          h3('.subtitle', { style: fadeInOutStyle }, [moment(start_time).format('llll')])
        ]),
        div('.separator'),
        div('.description', { props: { innerHTML: marked(abstract) }, style: fadeInOutStyle }),
        div('.footer', [
          !!meetup_urlname && !!meetup_event_id ? button('.action', { style: fadeInOutStyle }, ['View Details']) : null
        ])
      ])
    ])
  );
  navigateTo$.addListener({ next: location => window.open(location, '_blank') });
  return {
    dom: vtree$,
    history: Stream.empty()
  };
}

export const Event: (sources: Sources) => Sinks = sources => isolate(EventComponent)(sources);
