import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../../definitions';
import { topEvents, moreEvents } from '../../drivers/events';
import { RegistrationRequest } from '../../drivers/registrations';
import { TalkRegistration } from './components/TalkRegistration';
import { renderEvent } from './components/Event';
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

export function Home(sources: Sources): Sinks {
  const xs = Stream;
  const dom = sources.dom;
  const presentClick$ =
    dom
      .select('#present')
      .events('click');
  const presentCheckboxClick$ =
    dom
      .select('#presentCheckbox')
      .events('click');
  const present$ =
    presentClick$
      .map(ev => {
        const labelElement = ev.currentTarget as HTMLLabelElement;
        const isLabel = labelElement === ev.target;
        const checkBoxElement = labelElement.children[0] as HTMLInputElement;
        if (isLabel) {
          checkBoxElement.checked = !checkBoxElement.checked;
        }
        return checkBoxElement.checked;
      })
      .startWith(false);
  const events$ = sources.events.events$.remember();
  const registration$ = sources.registrations.registration$;
  const moreClick$ =
    dom
      .select('.more')
      .events('click');
  const more$ =
    moreClick$
      .map(ev => true)
      .startWith(false);
  const eventClick$ =
    dom
      .select('.event.card:not(.expanded)')
      .events('click').filter(e => {
        const target = e.target as HTMLElement;
        return target.className !== 'avatar'
          && target.className !== 'location'
          && target.parentElement.className !== 'speakers'
          && target.parentElement.className !== 'secondary info';
      });
  const speakerClick$ =
    dom
      .select('.speakers.content.link')
      .events('click');
  const navigateTo$ =
    eventClick$
      .map<string>(ev => '/events/' + (ev.currentTarget as HTMLElement).attributes['data-url'].value);
  const shrinkEventClick$ =
    dom
      .select('.shrink')
      .events('click');
  const shorten$ =
    xs.merge(
      navigateTo$
        .filter(e => e !== '' && e !== '/')
        .map(() => xs.of(false)),
      shrinkEventClick$
        .map(ev => xs.of(true))
    ).flatten()
      .startWith(true);
  const joinEventClick$ =
    dom
      .select('.join.event')
      .events('click');
  const formCloseClick$ =
    dom
      .select('button.close')
      .events('click');
  const join$ =
    xs.merge(
      joinEventClick$
        .map(ev => {
          const anchor = ev.currentTarget as HTMLAnchorElement;
          const card = closestParent(anchor, '.event.card');
          anchor.classList.add('expand');
          return xs.of<string>(card.attributes['data-url'].value);
        }),
      formCloseClick$
        .map(ev => {
          const closeButton = ev.currentTarget as HTMLButtonElement;
          const card = closestParent(closeButton, '.event.card');
          const anchor = card.querySelector('.join.event');
          anchor.classList.remove('expand');
          return xs.of('');
        })
    ).flatten().startWith(eventRegisterHash);
  const formClick$ =
    dom
      .select('.form.event')
      .events('click');
  const formSubmit$ =
    dom
      .select('.form.event button[type=submit]')
      .events('click');
  const formSubmitRequest$ =
    events$
      .map(events =>
        formSubmit$
          .filter(ev => {
            // TODO: Validate
            const buttonElement = ev.currentTarget as HTMLButtonElement;
            const formElement = closestParent(buttonElement, 'form') as HTMLFormElement;
            const invalidElements = formElement.querySelectorAll('.is-invalid');
            return invalidElements.length === 0;
          })
          .map(ev => {
            const buttonElement = ev.currentTarget as HTMLButtonElement;
            const formElement = closestParent(buttonElement, 'form') as HTMLFormElement;
            const cardElement = closestParent(formElement, '.event.card');
            const eventUrl = cardElement.attributes['data-url'].value;
            const event = events.find(event => event.url === eventUrl);
            const request: RegistrationRequest = {
              event,
              data: getFormData(formElement)
            }
            return request;
          })
      ).flatten();
  const registrationSuccessfulUrl$ =
    registration$
      .filter(Boolean)
      .map(reg => reg.event_url)
      .startWith('its-real-time');
  const currentDate = new Date();
  const talkRegistration = TalkRegistration({ dom });
  const vdom$ =
    xs.combine(events$, more$, shorten$, join$, registrationSuccessfulUrl$, present$, talkRegistration.dom)
      .map(([events, more, shorten, join, registrationSuccessfulUrl, present, talkRegistrationDom]) => {
        return main([
          ...topEvents(events).map(event => renderEvent(event, join, shorten, registrationSuccessfulUrl, present)),
          ...moreEvents(events, more).map(event => renderEvent(event, join, shorten, registrationSuccessfulUrl, present)),
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
  const prevent$ =
    xs.merge(
      moreClick$,
      eventClick$,
      shrinkEventClick$,
      joinEventClick$,
      formClick$,
      formCloseClick$,
      formSubmit$,
      presentClick$,
      talkRegistration.prevent
    );
  presentCheckboxClick$.addListener({
    next: ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const checkbox = (ev.target as HTMLInputElement);
      checkbox.checked = !checkbox.checked;
      setTimeout(() => checkbox.parentElement.click(), 30);
    },
    error: () => { },
    complete: () => { }
  });
  const refresh$ = vdom$.compose(delay(30)).mapTo(true);
  return {
    dom: vdom$,
    events: xs.empty(),
    prevent: prevent$,
    registrations: formSubmitRequest$,
    history: navigateTo$,
    material: refresh$,
    talks: talkRegistration.talks
  };
}
