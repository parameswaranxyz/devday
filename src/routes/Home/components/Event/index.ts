import { Stream } from 'xstream';
import { div, article, h2, h3, button, p, VNode, DOMSource } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { DevdayEvent} from '../../../../definitions';
import * as moment from 'moment';
import './styles.scss';

const getMediaStyle = ({ color, image_url }: Partial<DevdayEvent>) => {
  var style = {};
  if (color) style['background-color'] = color;
  if (image_url != undefined) style['background-image'] = `url("${image_url}")`;
  return style;
};

interface Sources {
  dom: DOMSource;
  event: Stream<DevdayEvent>;
}

interface Sinks {
  dom: Stream<VNode>;
  prevent: Stream<Event>;
  history: Stream<string>;
}

const EventComponent = ({ dom, event }: Sources): Sinks => {
  const viewDetailsClick$ = dom.select('.action').events('click');
  const navigateToEvent$ = event.map(({ url }) => viewDetailsClick$.map(click => '/events/'+ url)).flatten();
  const vtree$ = event.map(({ title, event_time: { start_time }, abstract, venue: { city }, color, image_url }) =>
    article('.event', [
      div('.media', { style: getMediaStyle({ color, image_url }) }, [
        div('.overlay', [city])
      ]),
      div('.content', [
        div('.header', [
          h2('.title', { attrs: { title: title } }, [ title ]),
          h3('.subtitle', [moment(start_time).format('dddd, MMMM Do YYYY')])
        ]),
        div('.separator'),
        p('.description', { attrs: { title: abstract } }, [ abstract ]),
        div('.footer', [
          button('.action', ['View Details'])
        ])
      ])
    ])
  );
  return {
    dom: vtree$,
    prevent: viewDetailsClick$,
    history: navigateToEvent$
  };
}

export const Event: (sources: Sources) => Sinks = isolate(EventComponent);
