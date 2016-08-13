import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, address, br, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayEvent, Author } from './definitions';
import { CHENNAI_ADDRESS, BANGALORE_ADDRESS } from './data/events';

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];

function topEvents(events: DevdayEvent[]): DevdayEvent[] {
  const chennaiEvent =
    events
      .filter(ev => ev.venue === CHENNAI_ADDRESS)
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime())
      .shift();
  const bangaloreEvent =
    events
      .filter(ev => ev.venue === BANGALORE_ADDRESS)
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime())
      .shift();
  return [bangaloreEvent, chennaiEvent];
}

function moreEvents(events: DevdayEvent[], more: boolean): DevdayEvent[] {
  if (!more)
    return [];
  const topEventsResult = topEvents(events);
  const sortedEvents =
    events
      .sort((a, b) => b.event_time.start_time.getTime() - a.event_time.start_time.getTime());
  return sortedEvents.filter(event => topEventsResult.indexOf(event) === -1);
}

function renderBackground(event: DevdayEvent): VNode {
  var style = '';
  if (event.color)
    style += `background-color: ${event.color};`;
  if (event.image_url != undefined)
    style += `background-image: url("${event.image_url}");`;
  if (event.background_size != undefined)
    style += `background-size: ${event.background_size};`;
  return div('.background', { attrs: { style } });
}

function findChildIndex(node: VNode): number {
  const element = node.elm as HTMLElement;
  const childNodes = element.parentElement.childNodes;
  for (var i = 0; i < childNodes.length; i++)
    if (childNodes[i] === element)
      return i;
  return -1;
}

function renderEvent(event: DevdayEvent, expand: string, shorten: boolean): VNode {
  return article('.event.card' + ((!shorten && (event.url == expand)) ? '.expanded' : ''), {
    attrs: {
      'data-url': event.url
    },
    hook: {
      insert: (node: VNode) => {
        const index = findChildIndex(node);
        setTimeout(() => {
          const element = (node.elm as HTMLElement);
          element.classList.add('show');
          setTimeout(() => {
            element.querySelector('.primary.info').classList.add('loaded');
            setTimeout(() => {
              element.querySelector('.speakers').classList.add('loaded');
              element.querySelector('.primary.info > .content').classList.add('loaded');
              setTimeout(() => {
                element.querySelector('.secondary.info').classList.add('loaded');
                element.querySelector('.speakers > .content').classList.add('loaded');
                setTimeout(() => {
                  element.querySelector('.secondary.info > .content').classList.add('loaded');
                }, 150);
              }, 150);
            }, 300);
          }, 150);
        }, index * 300);
      }
    }
  }, [
      div('.primary.info', [
        div('.content', [
          h4([event.event_time.start_time.toDateString()]),
          h3([event.title]),
          p([event.abstract]),
        ])
      ]),
      renderBackground(event),
      div('.speakers', [
        div('.content',
          [].concat.apply([], event.agenda.filter(entry => Boolean(entry.authors) && Boolean(entry.authors.length)).map(entry => entry.authors))
            .map((speaker: Author) => img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } })))
      ]),
      div('.secondary.info', [
        div('.content', [
          div('.location', [
            address([
              event.venue.locality + ',',
              br(),
              event.venue.city
            ])
          ]),
          div('.attending', [
            p('JOIN NOW')
          ])
        ])
      ]),
      a('.go.to.event.button', { props: { title: 'go to event', href: '#/' + event.url } }, [
        span('.hidden', 'go to event'),
        i('.material-icons', 'keyboard_arrow_right')
      ])
    ]);
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
      button('.twitter.social.button', [
        span('.hidden', 'twitter')
      ]),
      button('.facebook.social.button', [
        span('.hidden', 'facebook')
      ]),
      button('.google.plus.social.button', [
        span('.hidden', 'google plus')
      ])
    ]),
    div('.right.section', [
      button('.share.social.button', [
        i('.material-icons', { props: { role: 'presentation' } }, 'share'),
        span('.hidden', 'share')
      ])
    ])
  ]);
}

function home(sources: Sources): Sinks {
  const xs = Stream;
  const dom = sources.dom;
  const route$ = sources.routes.route$;
  const events$ = sources.events.events$;
  const noun$ = xs.periodic(1000)
    .startWith(0)
    .map(x => x % nouns.length)
    .map(i => nouns[i]);
  const topic$ = xs.periodic(3000)
    .startWith(0)
    .map(x => x % topics.length)
    .map(i => topics[i]);
  const more$ =
    dom
      .select('.more')
      .events('click')
      .map(ev => {
        ev.preventDefault();
        ev.stopPropagation();
        return true;
      })
      .startWith(false);
  const expand$ =
    dom
      .select('.event.card:not(.expanded)')
      .events('click')
      .map(ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget as HTMLElement;
        return element.attributes['data-url'].value;
      })
      .startWith('');
  const shorten$ =
    xs.merge(
      expand$
        .filter(e => e !== '')
        .map(() => xs.of(false)),
      dom
        .select('.event.card.expanded')
        .events('click')
        .map(ev => {
          ev.preventDefault();
          ev.stopPropagation();
          return xs.of(true);
        })
        .startWith(xs.of(false))
    ).flatten();
  const currentDate = new Date();
  const vtree$ =
    route$
      .map(url =>
        xs.combine(noun$, topic$, events$, more$, expand$, shorten$)
          .filter(() => url === '')
          .map(([noun, topic, events, more, expand, shorten]) =>
            div('.devday.home', [
              div('.container', [
                div('.layout', [
                  div('.content', [
                    renderHeader(noun, topic),
                    main([
                      ...topEvents(events).map(event => renderEvent(event, expand, shorten)),
                      ...moreEvents(events, more).map(event => renderEvent(event, expand, shorten)),
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
                    ]),
                    renderFooter()
                  ])
                ])
              ])
            ])
          )
      ).flatten();

  return {
    dom: vtree$,
    events: xs.empty(),
    routes: xs.empty(),
    prevent: xs.empty()
  };
}

export default home;
