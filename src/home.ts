import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, header, h1, span, img, h2, h3, h4, p, main, article, a, i, nav, button, footer, address, br, form, input, label, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, DevdayEvent, Author, DevdayRegistrationData } from './definitions';
import { topEvents, moreEvents } from './drivers/events';
import { RegistrationRequest } from './drivers/registrations';
import { getAgendaNodes } from './event';
import delay from 'xstream/extra/delay';

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];

function renderBackground(event: DevdayEvent): VNode {
  var style = {};
  if (event.color)
    style['background-color'] = event.color;
  if (event.image_url != undefined)
    style['background-image'] = `url("${event.image_url}")`;
  if (event.background_size != undefined)
    style['background-size'] = event.background_size;
  return div('.background', { style });
}

function renderForm(event: DevdayEvent, clicked: boolean, loaded: boolean): VNode[] {
  const buttonStyle = clicked
    ? {
      transform: 'scale(1)',
      delayed: { transform: 'scale3d(21, 21, 1)' },
      destroy: { transform: 'scale(1)' }
    }
    : {
      transform: 'scale(0)',
      delayed: { transform: 'scale(1)' },
      destroy: { transform: 'scale(0)' }
    };
  const formClassName = loaded ? '.loaded' : '';
  const showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
  if (!showForm)
    return [];
  return [
    a('.join.event.button', {
      props: {
        title: 'join event',
        href: '#'
      },
      attrs: {
        'data-url': event.url
      },
      style: buttonStyle,
    }, [
        span('.hidden', 'join event'),
        i('.material-icons', 'add')
      ]),
    form('.event.form' + formClassName, [
      div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
        input('.mdl-textfield__input', {
          props: {
            id: 'name',
            placeholder: 'Name'
          }
        }),
        label('.mdl-textfield__label', {
          props: {
            for: 'name'
          }
        }, ['Name'])
      ]),
      div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
        input('.mdl-textfield__input', {
          props: {
            id: 'email',
            placeholder: 'Email'
          }
        }),
        label('.mdl-textfield__label', {
          props: {
            for: 'email'
          }
        }, ['Email'])
      ]),
      div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
        input('.mdl-textfield__input', {
          props: {
            id: 'mobile',
            placeholder: 'Mobile'
          }
        }),
        label('.mdl-textfield__label', {
          props: {
            for: 'mobile'
          }
        }, ['Mobile'])
      ]),
      p('Please fill out the following in case you want to present a talk/workshop'),
      div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
        input('.mdl-textfield__input', {
          props: {
            id: 'title',
            placeholder: 'Title'
          }
        }),
        label('.mdl-textfield__label', {
          props: {
            for: 'title'
          }
        }, ['Title'])
      ]),
      div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
        input('.mdl-textfield__input', {
          props: {
            id: 'abstract',
            placeholder: 'Abstract'
          }
        }),
        label('.mdl-textfield__label', {
          props: {
            for: 'abstract'
          }
        }, ['Abstract'])
      ]),
      button({
        props: {
          type: 'submit'
        }
      }, ['Join Us!'])
    ])
  ]
}

const fadeInOutStyle = {
  opacity: '0', delayed: { opacity: '1' }, remove: { opacity: '0' }
};

function renderEvent(event: DevdayEvent, expand: string, shorten: boolean, clicked: string, loaded: string): VNode {
  const expanded = ((!shorten && (event.url === expand)) ? '.expanded' : '');
  const clickedBoolean = clicked === event.url;
  const loadedBoolean = loaded === event.url;
  return article('.event.card' + expanded, {
    attrs: {
      'data-url': event.url
    },
    style: {
      transform: 'scale(0)',
      opacity: '0',
      delayed: {
        transform: 'scale(1)',
        opacity: '1'
      }
    }
  }, [
      div('.primary.info', {
        style: {
          right: '100%',
          delayed: {
            right: '35%'
          }
        }
      }, [
          div('.content', {
            style: fadeInOutStyle
          }, [
              h4([event.event_time.start_time.toDateString()]),
              h3([event.title]),
              p([event.abstract]),
            ])
        ]),
      renderBackground(event),
      div('.speakers', {
        style: {
          top: '540px',
          delayed: {
            top: '312px'
          }
        }
      }, [
          div('.content', {
            style: fadeInOutStyle
          },
            [].concat.apply([], event.agenda.filter(entry => Boolean(entry.authors) && Boolean(entry.authors.length)).map(entry => entry.authors))
              .map((speaker: Author) => img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } })))
        ]),
      div('.agenda', [
        div('.content', { style: fadeInOutStyle }, getAgendaNodes(event.agenda))
      ]),
      div('.secondary.info', {
        style: {
          top: '540px',
          delayed: {
            top: '440px'
          }
        }
      },
        [
          div('.content', {
            style: fadeInOutStyle
          }, [
              div('.location', [
                address([
                  event.venue.locality + ',',
                  br(),
                  event.venue.city
                ]),
                a({ props: { href: event.venue.map_link } }, [
                  div('.filler', {
                    attrs: {
                      style: `background-image: url("${event.venue.map_image}");`
                    }
                  })
                ])
              ]),
              div('.attending', [
                p([event.attending != undefined ? `${event.attending} attending` : 'JOIN NOW'])
              ])
            ])
        ]),
      ...renderForm(event, clickedBoolean, loadedBoolean)
    ]);
}

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
  const join$ =
    joinEventClick$
      .map(ev => {
        const anchor = ev.currentTarget as HTMLAnchorElement;
        const card = closest(anchor, '.event.card');
        anchor.classList.add('expand');
        return card.attributes['data-url'].value;
      })
      .startWith('');
  const formClick$ =
    dom
      .select('.form.event')
      .events('click');
  const formLoaded$ = join$.compose(delay<string>(1000));
  const formSubmit$ =
    dom
      .select('.form.event button')
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
        xs.combine(noun$, topic$, events$, more$, expand$, shorten$, join$, formLoaded$)
          .filter(() => url === '')
          .map(([noun, topic, events, more, expand, shorten, join, loaded]) =>
            div('.devday.home', [
              div('.container', [
                div('.layout', [
                  div('.content', [
                    renderHeader(noun, topic),
                    main([
                      ...topEvents(events).map(event => renderEvent(event, expand, shorten, join, loaded)),
                      ...moreEvents(events, more).map(event => renderEvent(event, expand, shorten, join, loaded)),
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
