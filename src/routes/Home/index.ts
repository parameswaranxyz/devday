import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { topEvents, moreEvents, getEventsList } from '../../drivers/events';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { Event } from './components/Event';
import delay from 'xstream/extra/delay';
import { closestParent } from '../../utils';
import './styles.scss';

const eventHash = location.hash.match('/register/') ? "" : location.hash.replace("#/", "");
const eventRegisterHash = location.hash.match('/register/') ? location.hash.replace("#/register/", "") : "";

function getFormData(form: HTMLFormElement): DevdayRegistrationData {
  return {
    name: form.elements['name'].value,
    email: form.elements['email'].value,
    mobile: form.elements['mobile'].value,
    present: form.elements['presentCheckbox'].checked,
    title: form.elements['title'] && form.elements['title'].value,
    abstract: form.elements['abstract'] && form.elements['abstract'].value,
  }
}

export function Home({ dom, talks, events, registrations }: Sources): Sinks {
  const xs = Stream;
  const events$ = events.events$.remember();
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
  const eventCards$ =
    xs.combine(events$, more$)
      .map(([events, more]) =>
        getEventsList(events, more)
          .map(event => Event({ dom, event: Stream.of(event) }))
      );
  const eventCardDoms$ = eventCards$.map(sinks => Stream.combine(...sinks.map(s => s.dom)) as Stream<VNode[]>).flatten();
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
    eventCards$
      .map(sinks => sinks.map(s => s.prevent))
      .map(prevents => xs.combine(...prevents) as Stream<Event[]>)
      .flatten()
      .map(events => xs.fromArray(events))
      .flatten();
  const navigateTo$ =
    eventCards$
      .map(sinks => sinks.map(s => s.history))
      .map(histories => xs.combine(...histories) as Stream<string[]>)
      .flatten()
      .map(histories => xs.fromArray(histories))
      .flatten();
  const prevent$ =
    xs.merge(
      moreClick$,
      talkRegistration.prevent,
      eventCardprevents$
    );
  const refresh$ = vdom$.compose(delay(30)).mapTo(true);
  return {
    dom: vdom$,
    events: xs.empty(),
    prevent: prevent$,
    registrations: xs.empty(),
    history: navigateTo$,
    material: refresh$,
    talks: talkRegistration.talks,
    snackbars: talkRegistration.snackbars
  };
}
