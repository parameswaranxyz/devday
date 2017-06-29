import { Stream } from 'xstream';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from '../definitions';
import { topEvents, moreEvents } from '../drivers/events';
import { RegistrationRequest } from '../drivers/registrations';
import { renderEvent } from '../event';
import delay from 'xstream/extra/delay';
import { closest } from '../utils';

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
  const route$ = sources.routes.route$;
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
      .events('click').filter(e => e.target.className !== 'avatar' && e.target.className !== 'location' && e.target.parentElement.className !== 'speakers' && e.target.parentElement.className !== 'secondary info');
  const speakerClick$ =
    dom
      .select('.speakers.content.link')
      .events('click').map( e => { console.log('tes'); return e;});
  const navigateTo$ =
    eventClick$
      .map<string>(ev => '#/events/' + (ev.currentTarget as HTMLElement).attributes['data-url'].value);
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
          const card = closest(anchor, '.event.card');
          anchor.classList.add('expand');
          return xs.of<string>(card.attributes['data-url'].value);
        }),
      formCloseClick$
        .map(ev => {
          const closeButton = ev.currentTarget as HTMLButtonElement;
          const card = closest(closeButton, '.event.card');
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
            const formElement = closest(buttonElement, 'form') as HTMLFormElement;
            const invalidElements = formElement.querySelectorAll('.is-invalid');
            return invalidElements.length === 0;
          })
          .map(ev => {
            const buttonElement = ev.currentTarget as HTMLButtonElement;
            const formElement = closest(buttonElement, 'form') as HTMLFormElement;
            const cardElement = closest(formElement, '.event.card');
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
  const vdom$ =
    xs.combine(events$, more$, shorten$, join$, registrationSuccessfulUrl$, present$)
      .map(([events, more, shorten, join, registrationSuccessfulUrl, present]) => {
        return main([
          div(
            '.banner-card .mdl-card .mdl-shadow--2dp',
            {},
            [ div('.mdl-card__title', {}, [img('', { props: {src: '/images/devmerge-logo.png'}}, '')]),
              span('#dates', {}, 'August 19 & 20, 2017   IIT Madras Research Park, Chennai'),
              div('.banner-message .mdl-card__supporting-text', {}, "DEVMERGE_ is a hackathon where work is play and play is work. It has been our dream to bring together the best of hackers under one roof over a weekend and let them play! This August, our dream comes true."),
              div('.text-center .mdl-card__actions mdl-card--border', {}, [a('.mdl-button .mdl-button--colored .mdl-js-button .mdl-js-ripple-effect', { props: { href: 'http://devday.in/devmerge', target: "_blank" } }, "Register")] )]),
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
          ])
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
      presentClick$
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
    routes: xs.empty(),
    prevent: prevent$,
    registrations: formSubmitRequest$,
    history: navigateTo$,
    material: refresh$
  };
}
