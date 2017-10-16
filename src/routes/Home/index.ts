import { Stream } from 'xstream';
import { main, nav, h2, p, br, a } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { EventList } from '../../components/EventList';
import { ArchiveLink } from './components/ArchiveLink';
import delay from 'xstream/extra/delay';
import dropRepeats from 'xstream/extra/dropRepeats';
import { closestParent } from '../../utils';
import './styles.scss';

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const registration$ = registrations.registration$;
  const talkRegistration = TalkRegistration({ dom, talks });
  const eventList = EventList({ dom, events$: events.upcoming$ });
  const emptyDom$ =
    events.upcoming$
      .map(events => events.length)
      .compose(dropRepeats())
      .filter(length => length === 0)
      .mapTo(
        p('.message', [
          "We're ideating the topics and presentations for the next event.",
          br(),
          "If you have an idea, let us know using the form below, or contact us at ",
          a({ attrs: { href: 'mailto:devday.chn@gmail.com' } }, "devday.chn@gmail.com")
        ])
      ).startWith(null);
  const archiveLink = ArchiveLink({ dom });
  const vdom$ =
    xs.combine(eventList.dom, emptyDom$, archiveLink.dom, talkRegistration.dom)
      .map(([eventDoms, emptyDom, archiveLink, talkRegistrationDom]) =>
        main('.home', [
          h2('Upcoming events'),
          ...eventDoms,
          emptyDom,
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
