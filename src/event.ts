import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, article, a, img, i, span, header, nav, main, section, h4, h5, h6, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, AgendaEntry, AgendaEntryType } from './definitions';

function getDisplayTime(date: Date) {
  var timeSplits = date.toString().split(' ');
  return timeSplits[2] + ' ' + timeSplits[1] + ' ' + timeSplits[3];
}

function renderHeader(): VNode {
  return header([
    div('.container', [
      div('.content', [
        a('.title', { props: { href: '#/' } }, [
          img({ props: { src: 'images/logo.gif' } })
        ]),
        div('.navigation.container', [
          nav([
            a({ props: { href: '#/archive' } }, 'Archive')
          ])
        ])
      ])
    ])
  ]);
}

function pad(n: string, width: number, z?: string): string {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getHHMM(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours > 12 ? pad((hours - 12).toString(), 2) : pad(hours.toString(), 2)) + ':' + pad(minutes.toString(), 2);
}

function getMeridien(date: Date): string {
  return date.getHours() > 12 ? 'PM' : 'AM';
}

function renderAgendaEntry(entry: AgendaEntry): VNode[] {
  switch (entry.type) {
    case AgendaEntryType.Talk:
      return [
        div('.thumbnail', [
          h5([getHHMM(entry.time.start_time)]),
          h6([getMeridien(entry.time.start_time)])
        ]),
        div('.info', [
          img('.avatar', {
            props: {
              src:
              entry.authors[0] != undefined
                ? entry.authors[0].image_url || 'images/speakers/devday-speaker.png'
                : 'images/speakers/devday-speaker.png'
            }
          }),
          h5(entry.title),
          h6(['by ' + entry.authors.map(a => a.name).join(', ')]),
          entry.abstract
        ])
      ];
    case AgendaEntryType.Break:
      return [
        div('.thumbnail.break', [
          h5([getHHMM(entry.time.start_time)]),
          h6([getMeridien(entry.time.start_time)])
        ]),
        div('.info.break', [
          div('.centerer', [
            h5(entry.title)
          ])
        ])
      ];
  }
}

export function getAgendaNodes(agenda: AgendaEntry[]): VNode[] {
  return [].concat.apply([], agenda.map(renderAgendaEntry));
}

function renderAgenda(agenda: AgendaEntry[]): VNode {
  return section('.centered.agenda', [
    div('.twelve.column.card', [
      div('.content', [
        h4('.full.width', 'Agenda'),
        ...getAgendaNodes(agenda)
      ]),
      footer([
        a('.button', 'Register')
      ])
    ])
  ]);
}

function event(sources: Sources): Sinks {
  const xs = Stream;
  const route$ = sources.routes.route$;
  const event$ = sources.events.event$.filter(Boolean);
  const events$ = sources.events.events$;
  const eventRequest$ = route$
    .filter(url => url !== 'archive' && url !== '');
  const currentDate = new Date();
  const vdom$ =
    event$
      .map(event =>
        div('.devday.event', [
          div('.container', [
            div('.layout', [
              renderHeader(),
              main([
                div('.panel', [
                  section('.centered.intro', [
                    div('.twelve.column.card', [
                      div('.content', [
                        h4([
                          'Upcoming event: ',
                          span('.title', event.title),
                          ' on ' + event.event_time.start_time.toDateString()
                        ]),
                        event.abstract
                      ]),
                      footer([
                        a('.button', 'Participate'),
                        a('.button', 'Present')
                      ])
                    ])
                  ]),
                  renderAgenda(event.agenda),
                  section('.centered.info', [
                    div('.location.card', [
                      header([
                        a({ props: { href: event.venue.map_link } }, [
                          div('.filler', {
                            attrs: {
                              style: `background-image: url("${event.venue.map_image}");`
                            }
                          }, [
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
                        div('.absolute.right', [
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
    events: eventRequest$,
    prevent: xs.empty()
  };
}

export default event;
