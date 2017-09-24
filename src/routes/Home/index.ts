import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { EventList } from './components/EventList';
import delay from 'xstream/extra/delay';
import { closestParent } from '../../utils';
import './styles.scss';

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const registration$ = registrations.registration$;
  const moreClick$ = dom.select('.more').events('click', { preventDefault: true });
  const more$ = moreClick$.map(ev => true).startWith(false);
  const talkRegistration = TalkRegistration({ dom, talks });
  const eventList = EventList({ dom, events$: events.main$ });
  const vdom$ =
    xs.combine(eventList.dom, more$, talkRegistration.dom)
      .map(([eventDoms, more, talkRegistrationDom]) =>
        main([
          ...eventDoms,
          nav([
            a('.more', {
              props: { href: '#', title: 'view all previous events' },
              attrs: { style: more ? 'display: none;' : '' }
            }, [
                'Past events',
                button([
                  i('.material-icons', { props: { role: 'presentation' } }, 'arrow_forward')
                ])
              ])
          ]),
          talkRegistrationDom
        ])
      );
  return {
    dom: vdom$,
    events: xs.empty(),
    registrations: xs.empty(),
    history: eventList.history,
    material: xs.empty(),
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
