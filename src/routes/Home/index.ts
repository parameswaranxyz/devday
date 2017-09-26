import { Stream } from 'xstream';
import { main, nav, h2 } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { EventList } from '../../components/EventList';
import { ArchiveLink } from './components/ArchiveLink';
import delay from 'xstream/extra/delay';
import { closestParent } from '../../utils';
import './styles.scss';

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const registration$ = registrations.registration$;
  const talkRegistration = TalkRegistration({ dom, talks });
  const eventList = EventList({ dom, events$: events.upcoming$ });
  const archiveLink = ArchiveLink({ dom });
  const vdom$ =
    xs.combine(eventList.dom, archiveLink.dom, talkRegistration.dom)
      .map(([eventDoms, archiveLink, talkRegistrationDom]) =>
        main('.home', [
          h2('Upcoming events'),
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
    material: talkRegistration.material,
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
