import { Stream } from 'xstream';
import { div, article, h2, h3, button, p, VNode, DOMSource } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { DevdayEvent} from '../../../../definitions';
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

const EventComponent = ({ dom, event$ }: Sources): Sinks => {
  const viewDetailsClick$ = dom.select('.action').events('click', { preventDefault: true });
  const navigateTo$ = viewDetailsClick$.compose(sampleCombine(event$)).map(([_, { url }]) => '/events/'+ url);
  const vtree$ = event$.map(({ title, event_time: { start_time }, abstract, venue: { city }, image_url }) =>
    article('.event', [
      div('.media', { style: { 'background-image': `url("${image_url}")` } }, [
        div('.overlay', [city])
      ]),
      div('.content', [
        div('.header', [
          h2('.title', { attrs: { title: title } }, [ title ]),
          h3('.subtitle', [moment(start_time).format('dddd, MMMM Do YYYY')])
        ]),
        div('.separator'),
        div('.description', { props: { innerHTML: marked(abstract) } }),
        div('.footer', [
          button('.action', ['View Details'])
        ])
      ])
    ])
  );
  return {
    dom: vtree$,
    history: navigateTo$
  };
}

export const Event: (sources: Sources) => Sinks = sources => isolate(EventComponent)(sources);
