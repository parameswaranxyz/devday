import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { getEventsList } from '../../drivers/events';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { Event } from './components/Event';
import delay from 'xstream/extra/delay';
import { closestParent } from '../../utils';
import './styles.scss';

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const registration$ = registrations.registration$;
  const moreClick$ = dom.select('.more').events('click', { preventDefault: true });
  const more$ = moreClick$.map(ev => true).startWith(false);
  const talkRegistration = TalkRegistration({ dom, talks });
  const events$ =
    xs.combine(events.events$.compose(delay(300)), more$)
      .map(([events, more]) =>
        getEventsList(events, more)
          .map(event => Event({ dom, event$: xs.of(event) }))
      );
  const navigateTo$ =
    events$
      .map(sinks => sinks.map(s => s.history))
      .map(histories => xs.merge(...histories) as Stream<string>)
      .flatten();
  const eventCardDoms$ =
    events$
      .map(sinks => sinks.map(s => s.dom))
      .map<Stream<VNode[]>>(dom$s => xs.combine(...dom$s))
      .flatten();
  const vdom$ =
    xs.combine(eventCardDoms$, more$, talkRegistration.dom)
      .map(([eventCardDoms, more, talkRegistrationDom]) =>
        main([
          ...eventCardDoms,
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
    history: navigateTo$,
    material: xs.empty(),
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
