import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayRegistrationData } from './definitions';
import { topEvents, moreEvents } from './drivers/events';
import { RegistrationRequest } from './drivers/registrations';
import renderEvent from './event';
import delay from 'xstream/extra/delay';

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];

function getFormData(form: HTMLFormElement): DevdayRegistrationData {
  return {
    name: encodeURIComponent(form.elements['name'].value),
    email: encodeURIComponent(form.elements['email'].value),
    mobile: encodeURIComponent(form.elements['mobile'].value),
    title: encodeURIComponent(form.elements['title'].value),
    abstract: encodeURIComponent(form.elements['abstract'].value),
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
      p(['© Copyright 2016, Sahaj Software Solutions Pvt. Ltd.'])
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
  const route$ = sources.routes.route$;
  const events$ = sources.events.events$.remember();
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
      .map(ev => (ev.currentTarget as HTMLElement).attributes['data-url'].value)
      .startWith('');
  const expandedEventClick$ =
    dom
      .select('.event.card.expanded')
      .events('click');
  const shorten$ =
    xs.merge(
      expand$
        .filter(e => e !== '')
        .map(() => xs.of(false)),
      expandedEventClick$
        .map(ev => xs.of(true))
        .startWith(xs.of(false))
    ).flatten();
  const joinEventClick$ =
    dom
      .select('.join.event')
      .events('click');
  const formCloseClick$ =
    dom
      .select('.form.event button.close')
      .events('click');
  const join$ =
    xs.merge(
      joinEventClick$
        .map(ev => {
          const anchor = ev.currentTarget as HTMLAnchorElement;
          const card = closest(anchor, '.event.card');
          anchor.classList.add('expand');
          return xs.of(card.attributes['data-url'].value);
        }),
      formCloseClick$
        .map(ev => {
          const closeButton = ev.currentTarget as HTMLButtonElement;
          const card = closest(closeButton, '.event.card');
          const anchor = card.querySelector('.join.event');
          anchor.classList.remove('expand');
          return xs.of('');
        })
    ).flatten().startWith('');
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
  const currentDate = new Date();
  const vtree$ =
    route$
      .map(url =>
        xs.combine(noun$, topic$, events$, more$, expand$, shorten$, join$)
          .filter(() => url === '')
          .map(([noun, topic, events, more, expand, shorten, join]) =>
            div('.devday.home', [
              div('.container', [
                div('.layout', [
                  div('.content', [
                    renderHeader(noun, topic),
                    main([
                      ...topEvents(events).map(event => renderEvent(event, expand, shorten, join)),
                      // ...moreEvents(events, more).map(event => renderEvent(event, expand, shorten, join, loaded)),
                      // nav([
                      //   a('.more', {
                      //     props: { href: '#', title: 'view all previous events' },
                      //     attrs: { style: more ? 'display: none;' : '' }
                      //   }, [
                      //       'Past events',
                      //       button([
                      //         i('.material-icons', { props: { role: 'presentation' } }, 'arrow_forward')
                      //       ])
                      //     ])
                      // ])
                    ]),
                    renderFooter()
                  ])
                ])
              ])
            ])
          )
      ).flatten();
  const prevent$ =
    xs.merge(
      moreClick$,
      eventClick$,
      expandedEventClick$,
      joinEventClick$,
      formClick$,
      formCloseClick$,
      formSubmit$
    );
  vtree$.compose(delay<VNode>(30)).addListener({
    next: () => (<any>window).componentHandler.upgradeDom(),
    complete: () => { },
    error: () => { }
  });
  return {
    dom: vtree$,
    events: xs.empty(),
    routes: xs.empty(),
    prevent: prevent$,
    registrations: formSubmitRequest$
  };
}

export default home;
