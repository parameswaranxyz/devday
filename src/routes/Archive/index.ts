import { Stream } from 'xstream';
import { main, h2, button, i, a, nav } from '@cycle/dom';
import { Sources, Sinks } from '../../definitions';
import { EventList } from '../../components/EventList';
import './styles.scss';

export function Archive({ dom, events }: Sources): Sinks {
  const navigateTo$ =
    dom.select('.inline-back-button')
      .events('click', { preventDefault: true })
      .mapTo('/');
  const xs = Stream;
  const eventList = EventList({ dom, events$: events.archive$ });
  const vdom$ = eventList.dom.map(doms =>
    main('.archive', [
      nav([
        a('.inline-back-button', [
          button([
            i('.material-icons', { props: { role: 'presentation' } }, 'arrow_backward')
          ])
        ]),
        h2(['Events Archive'])
      ]),
      ...doms
    ])
  );
  return {
    dom: vdom$,
    events: xs.empty(),
    registrations: xs.empty(),
    history: xs.merge(eventList.history, navigateTo$),
    material: xs.empty(),
    talks: xs.empty(),
    snackbars: xs.empty()
  };
}
