import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { EventList } from './components/EventList';
import { ArchiveLink } from './components/ArchiveLink';
import delay from 'xstream/extra/delay';
import { closestParent } from '../../utils';
import './styles.scss';

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const registration$ = registrations.registration$;
  const talkRegistration = TalkRegistration({ dom, talks });
  const eventList = EventList({ dom, events$: events.main$ });
  const archiveLink = ArchiveLink({ dom });
  const vdom$ =
    xs.combine(eventList.dom, archiveLink.dom, talkRegistration.dom)
      .map(([eventDoms, archiveLink, talkRegistrationDom]) =>
        main([
          ...eventDoms,
          nav([ archiveLink ]),
          talkRegistrationDom
        ])
      );
  return {
    dom: vdom$,
    events: xs.empty(),
    registrations: xs.empty(),
    history: xs.merge(eventList.history, archiveLink.history),
    material: xs.empty(),
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
