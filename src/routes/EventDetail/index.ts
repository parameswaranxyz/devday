import { DevdayEvent, AgendaEntry, AgendaEntryType, DevdayRegistrationData } from '../../definitions';
import { VNode, DOMSource, article, div, h4, h3, h5, h6, p, a, address, br, span, i, form, button, label, input, textarea, img, main } from '@cycle/dom';
import { pad, fadeInOutStyle, closest } from '../../utils';
import { Stream } from 'xstream';
import { HistoryInput } from '@cycle/history';
import { EventsSource } from '../../drivers/events';
import { RegistrationsSource, RegistrationRequest, RegistrationResult } from '../../drivers/registrations';
import { RegistrationForm } from './components/RegistrationForm';
import isolate from '@cycle/isolate';
import delay from 'xstream/extra/delay';
import './styles.scss';

function getHHMM(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours > 12 ? pad((hours - 12).toString(), 2) : pad(hours.toString(), 2)) + ':' + pad(minutes.toString(), 2);
}

function getMeridien(date: Date): string {
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

function getAuthorInfo(entry) {
  let authorChildren = entry.authors && entry.authors[0] ? [a('.link',
    { props: { href: entry.authors[0].linkedin_profile_url || "#", target: "_blank" } },
    img('.avatar', { props: { src: entry.authors[0].image_url || 'images/speakers/devday-speaker.png' } })
  ),
  h5(entry.title),
  h6(['by ' + entry.authors.map(a => a.name).join(', ')])
  ]
    : [h5(entry.title)];
  return div('.info', authorChildren.concat([p(entry.abstract)].concat(getTalkMaterials(entry))));
}

function getTalkMaterials(entry) {
  let materialsContent = [];
  if (entry.video) materialsContent.push(a('.video', { props: { href: entry.video || "#", target: "_blank" } }, [
    span('', 'Video')
  ]))
  if (entry.ppt) materialsContent.push(a('.ppt', { props: { href: entry.ppt || '#', target: "_blank" } }, [
    span('', 'Slides')
  ]))
  return materialsContent;
}

function renderAgendaEntry(entry: AgendaEntry): VNode[] {
  switch (entry.type) {
    case AgendaEntryType.Talk:
    case AgendaEntryType.Workshop:
      return [
        div('.agenda', [
          entry.time ? div('.thumbnail', [
            h5([getHHMM(entry.time.start_time)]),
            h6([getMeridien(entry.time.start_time)])
          ]) : div('', ''),
          getAuthorInfo(entry)
        ])
      ];
    case AgendaEntryType.Break:
      return [
        div('.agenda', [
          div('.thumbnail.break', [
            h5([getHHMM(entry.time.start_time)]),
            h6([getMeridien(entry.time.start_time)])
          ]),
          div('.info.break', [
            div('.centerer', [
              h5(entry.title)
            ])
          ])
        ])
      ];
  }
}

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

export function renderExpandedEvent(event: DevdayEvent, form: VNode): VNode {
  return article('.event.card.expanded', {
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
    },
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
      event.agenda.length > 0
      ? div('.agenda', [div('.content', { style: fadeInOutStyle }, [].concat.apply([], event.agenda.map(renderAgendaEntry)))])
      : div('.secondary.info', { style: { color: 'white' } }, [div('.content', (<any>event).details)]),
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
                a({
                  props: {
                    target: '_blank',
                    href: event.venue.map_link
                  }
                },
                  [
                    div('.filler', {
                      attrs: {
                        style: `background-image: url("${event.venue.map_image}");`
                      }
                    })
                  ]),
                address([
                  event.venue.line_one,
                  br(),
                  event.venue.line_two,
                  br(),
                  event.venue.locality,
                  br(),
                  event.venue.city + ' - ' + event.venue.zip
                ])
              ]),
              div('.attending', [form])
            ]),
        ]),
      a('.shrink.button', {
        props: {
          title: 'close event',
          href: '#/'
        }
      }, [
          span('.hidden', 'close event'),
          i('.material-icons', 'close')
        ])
    ]);
}

interface EventDetailSources {
  dom: DOMSource;
  history: Stream<Location>;
  events: EventsSource;
  eventUrl$: Stream<string>;
  registrations: RegistrationsSource;
}

interface EventDetailSinks {
  dom: Stream<VNode>;
  history: Stream<HistoryInput | string>;
  prevent: Stream<Event>;
  registrations: Stream<RegistrationRequest>;
  material: Stream<boolean>;
}

export function EventDetailComponent(sources: EventDetailSources): EventDetailSinks {
  const xs = Stream;
  const eventUrl$ = sources.eventUrl$;
  const event$ =
    eventUrl$
      .map(eventUrl =>
        sources.events.events$
          .map(events => events.find(event => event.url === eventUrl)))
      .flatten();
  const shrinkButtonClick$ =
    sources.dom.select('.shrink.button').events('.click');
  const history$ = shrinkButtonClick$.mapTo('/');
  const success$ =
    event$
      .map(event =>
        sources.registrations.registration$
          .filter(Boolean)
          .map(reg => reg.event_url === event.url)
          .startWith(false)
      )
      .flatten();
  const present$ = xs.create<boolean>();
  const formSinks = RegistrationForm({
    dom: sources.dom,
    event$,
    success$,
    present$
  });
  present$.imitate(formSinks.present$);
  const vdom$ =
    xs.combine(event$, formSinks.dom)
      .map(([event, formDom]) => main([renderExpandedEvent(event, formDom)]));
  const refresh$ = vdom$.compose(delay(30)).mapTo(true);
  return {
    dom: vdom$,
    history: history$,
    prevent: xs.merge(shrinkButtonClick$, formSinks.prevent),
    registrations: formSinks.registrations,
    material: refresh$
  }
}

export const EventDetail = (sources: EventDetailSources) => isolate(EventDetailComponent)(sources) as EventDetailSinks;
