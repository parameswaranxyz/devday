import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData, DevdayEvent } from './definitions';
import { topEvents, moreEvents } from './drivers/events';
import { RegistrationRequest } from './drivers/registrations';
import { renderEvent, renderExpandedEvent } from './event';
import delay from 'xstream/extra/delay';

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];
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

function renderHeader(noun: string, topic: string): VNode {
  return header([
    h1([
      span('.hidden', 'devday_'),
      img({ props: { src: 'images/logo.gif' } })
    ]),
    h2([
      'a monthly informal event for developers to share their ',
      span('.noun', noun),
      ' about ',
      span('.topic', topic)
    ])
  ]);
}

function renderFooter(): VNode {
  return footer([
    div('.left.section', [
      a('.twitter.social.button', {
        props: {
          href: 'https://twitter.com/devday_',
          target: '_blank'
        }
      }, [
          span('.hidden', 'twitter')
        ]),
      a('.facebook.social.button', {
        props: {
          href: 'https://facebook.com/d3vday',
          target: '_blank'
        }
      }, [
          span('.hidden', 'facebook')
        ])
    ]),
    div('.right.section', [
      // button('.share.social.button', [
      //   i('.material-icons', { props: { role: 'presentation' } }, 'share'),
      //   span('.hidden', 'share')
      // ]),
      p([
        '© 2016 - Organised by ',
        a('.sahaj.org.link', {
          props: {
            href: 'https://sahajsoft.com',
            target: '_blank'
          }
        }, 'Sahaj Software Solutions')
      ])
    ])
  ]);
}

function closest(el: HTMLElement, selector: string): HTMLElement {
  var retval: HTMLElement = undefined;
  while (el) {
    if (el.matches(selector)) {
      retval = el;
      break
    }
    el = el.parentElement;
  }
  return retval;
}

function home(sources: Sources): Sinks {
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
  const noun$ = xs.periodic(1000)
    .startWith(0)
    .map(x => x % nouns.length)
    .map(i => nouns[i]);
  const topic$ = xs.periodic(3000)
    .startWith(0)
    .map(x => x % topics.length)
    .map(i => topics[i]);
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
      .events('click');
  const expand$ =
    eventClick$
      .map<string>(ev => (ev.currentTarget as HTMLElement).attributes['data-url'].value)
      .startWith(eventHash);
  const shrinkEventClick$ =
    dom
      .select('.shrink')
      .events('click');
  const shorten$ =
    xs.merge(
      expand$
        .filter(e => e !== '')
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
  const headerDom$ =
    xs.combine(noun$, topic$)
      .map(([noun, topic]) => renderHeader(noun, topic));
  const footerDom$ = xs.of(renderFooter());
  const bodyDom$ =
    xs.combine(events$, more$, expand$, shorten$, join$, registrationSuccessfulUrl$, present$)
      .map(([events, more, expand, shorten, join, registrationSuccessfulUrl, present]) => {
        const expandedEvent = !shorten && events.find(event => event.url === expand);
        return main(
          Boolean(expandedEvent)
            ? [renderExpandedEvent(expandedEvent, registrationSuccessfulUrl, present)]
            : [
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
  const vdom$ =
    xs.combine(headerDom$, bodyDom$, footerDom$)
      .map(([headerDom, bodyDom, footerDom]) =>
        div('.devday.home', [
          div('.container', [
            div('.layout', [
              div('.content', [
                headerDom,
                bodyDom,
                footerDom
              ])
            ])
          ])
        ]));
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
  vdom$.compose(delay<VNode>(30)).addListener({
    next: () => (<any>window).componentHandler.upgradeDom(),
    complete: () => { },
    error: () => { }
  });
  return {
    dom: vdom$,
    events: xs.empty(),
    routes: xs.empty(),
    prevent: prevent$,
    registrations: formSubmitRequest$,
    history: xs.empty()
  };
}

export default home;
