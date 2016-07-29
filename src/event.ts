import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, article, a, img, i, span, header, nav, main, section, h4, h5, h6, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, BaseUrlProvider, AgendaEntry } from './definitions';

function getDisplayTime(date: Date) {
  var timeSplits = date.toString().split(' ');
  return timeSplits[2] + ' ' + timeSplits[1] + ' ' + timeSplits[3];
}

function renderHeader(baseUrl: string): VNode {
  return header([
    div('.container', [
      div('.content', [
        a('.title', { props: { href: baseUrl + '/' } }, [
          img({ props: { src: baseUrl + 'images/logo.gif' } })
        ]),
        div('.navigation.container', [
          nav([
            a({ props: { href: baseUrl + '/archive/' } }, 'Archive')
          ])
        ])
      ])
    ])
  ]);
}

function renderAgendaEntry(entry: AgendaEntry): VNode {
  // TODO: Render
  return div('.thumbnail');
}

function event(sources: Sources): Sinks {
  const xs = Stream;
  const route$ = sources.routes.route$;
  const event$ = sources.events.event$.filter(Boolean);
  const events$ = sources.events.events$;
  const baseUrl = (window as BaseUrlProvider).baseUrl;
  const eventRequest$ = route$
      .filter(url => url !== 'archive' && url !== '');
  const currentDate = new Date();
  const vdom$ =
    event$
    .map(event =>
        div('.devday.event', [
            div('.container', [
              div('.layout', [
                renderHeader(baseUrl),
                main([
                  div('.panel', [
                    section('.centered.intro', [
                      div('.twelve.column.card', [
                        div('.content', [
                          h4([
                            'Upcoming event: ',
                            span('.title', event.title),
                            ' on '+ event.event_time.start_time.toDateString()
                          ]),
                          event.abstract
                        ]),
                        footer([
                          a('.button', 'Participate'),
                          a('.button', 'Present')
                        ])
                      ])
                    ]),
                    section('.centered.agenda', [
                      div('.twelve.column.card', [
                        div('.content', [
                          h4('.full.width', 'Agenda'),
                          ...event.agenda.map(renderAgendaEntry)
                        ]),
                        footer([
                          a('.button', 'Register')
                        ])
                      ])
                    ]),
                    section('.centered.info', [
                      div('.location.card', [
                        header([
                          a({ props: { href: event.venue.map_link }}, [
                            div('.filler', [
                              h4(['Location'])
                            ])
                          ])
                        ])
                      ]),
                      div('.event.card', [
                        header([
                          h4([event.title]),
                          h5([event.event_time.start_time.toDateString()]),
                          h6([event.event_time.start_time.toTimeString()])
                        ]),
                        footer([
                          a('.button', 'Add to calendar'),
                          div('.absolute.right',[
                            a('.button', [
                              i('.material-icons', 'event')
                            ])
                          ])
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ])
        ])
      );

  return {
    dom: vdom$,
    routes: xs.empty(),
    events: eventRequest$
  };
}

export default event;
