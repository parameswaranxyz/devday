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
  const moreClick$ =
    dom
      .select('.more')
      .events('click');
  const more$ =
    moreClick$
      .map(ev => true)
      .startWith(false);
  const talkRegistration = TalkRegistration({ dom, talks });
  const events$ =
    xs.combine(events.events$, more$)
      .map(([events, more]) =>
        getEventsList(events, more)
          .map(event => Event({ dom, event: Stream.of(event) }))
      );
  const eventCardDoms$ = events$.map(sinks => Stream.combine(...sinks.map(s => s.dom)) as Stream<VNode[]>).flatten();
  const vdom$ =
    xs.combine(eventCardDoms$, more$, talkRegistration.dom)
      .map(([eventCardDoms, more, talkRegistrationDom]) => {
        return main([
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
        ]);
      });
  const eventCardprevents$ =
    events$
      .map(sinks => sinks.map(s => s.prevent))
      .map(prevents => xs.merge(...prevents) as Stream<Event>)
      .flatten();
  const navigateTo$ =
    events$
      .map(sinks => sinks.map(s => s.history))
      .map(histories => xs.merge(...histories) as Stream<string>)
      .flatten();
  const prevent$ =
    xs.merge(
      moreClick$,
      talkRegistration.prevent,
      eventCardprevents$
    );
  return {
    dom: vdom$,
    events: xs.empty(),
    prevent: prevent$,
    registrations: xs.empty(),
    history: navigateTo$,
    material: xs.empty(),
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
