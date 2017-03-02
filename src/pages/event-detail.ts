import { DevdayEvent, AgendaEntry, AgendaEntryType } from '../definitions';
import { VNode, DOMSource, article, div, h4, h3, h5, h6, p, a, address, br, span, i, form, button, label, input, textarea, img, main } from '@cycle/dom';
import { pad, fadeInOutStyle } from '../utils';
import { Stream } from 'xstream';
import { HistoryInput } from 'history';
import { EventsSource } from '../drivers/events';
import isolate from '@cycle/isolate';

function getHHMM(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours > 12 ? pad((hours - 12).toString(), 2) : pad(hours.toString(), 2)) + ':' + pad(minutes.toString(), 2);
}

function getMeridien(date: Date): string {
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

function getAuthorInfo(entry) {
  let authorChildren = entry.authors && entry.authors[0] ? [img('.avatar', {
    props: {
      src:
      entry.authors[0] != undefined
        ? entry.authors[0].image_url || 'images/speakers/devday-speaker.png'
        : 'images/speakers/devday-speaker.png'
    }
  }),
  h5(entry.title),
  h6(['by ' + entry.authors.map(a => a.name).join(', ')])]
    : [h5(entry.title)];
  return div('.info', authorChildren.concat([
    p(entry.abstract)
  ]));
}

function renderAgendaEntry(entry: AgendaEntry): VNode[] {
  switch (entry.type) {
    case AgendaEntryType.Talk:
    case AgendaEntryType.Workshop:
      return [
        div('.agenda', [
          div('.thumbnail', [
            h5([getHHMM(entry.time.start_time)]),
            h6([getMeridien(entry.time.start_time)])
          ]),
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

function renderFormFields(present: boolean): VNode[] {
  const presentFields =
    present
      ? [
        div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
          input('.mdl-textfield__input', {
            props: {
              id: 'title',
              placeholder: 'Title',
              required: 'required'
            }
          }),
          label('.mdl-textfield__label', {
            props: {
              for: 'title'
            }
          }, ['Title']),
          span('mdl-textfield__error', 'Please enter a title!')
        ]),
        div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
          textarea('.mdl-textfield__input', {
            props: {
              id: 'abstract',
              placeholder: 'Abstract',
              required: 'required'
            }
          }),
          label('.mdl-textfield__label', {
            props: {
              for: 'abstract'
            }
          }, ['Abstract']),
          span('mdl-textfield__error', 'Please enter an abstract!')
        ])
      ]
      : [];
  return [
    div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
      input('.mdl-textfield__input', {
        props: {
          id: 'name',
          placeholder: 'Name',
          pattern: '^[a-zA-Z][a-zA-Z ]{4,}',
          required: 'required'
        }
      }),
      label('.mdl-textfield__label', {
        props: {
          for: 'name'
        }
      }, ['Name']),
      span('mdl-textfield__error', 'Please enter a valid name!')
    ]),
    div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
      input('.mdl-textfield__input', {
        props: {
          id: 'email',
          placeholder: 'Email',
          type: 'email',
          required: 'required'
        }
      }),
      label('.mdl-textfield__label', {
        props: {
          for: 'email'
        }
      }, ['Email']),
      span('mdl-textfield__error', 'Please enter a valid email!')
    ]),
    div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
      input('.mdl-textfield__input', {
        props: {
          id: 'mobile',
          placeholder: 'Mobile',
          pattern: '^[987][0-9]{9}$',
          required: 'required'
        },
        attrs: {
          maxlength: '10'
        }
      }),
      label('.mdl-textfield__label', {
        props: {
          for: 'mobile'
        }
      }, ['Mobile']),
      span('mdl-textfield__error', 'Please enter a valid mobile number!')
    ]),
    label('#present', {
      props: {
        for: 'presentCheckbox'
      }
    }, [
        input('#presentCheckbox', { attrs: { type: 'checkbox' } }),
        'I want to present a talk/workshop'
      ]),
    ...presentFields
  ];
}

function renderExpandedForm(event: DevdayEvent, registrationSuccessful: boolean, present: boolean): VNode {
  const showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
  if (!showForm)
    return p(['This event no longer accepts new registrations.']);
  return registrationSuccessful
    ? div('.registration.success', [
      p('.message', `Your registration was successful! See you on ${event.event_time.start_time.toDateString()}`)
    ])
    : form('.event.form', { style: fadeInOutStyle }, [
      ...renderFormFields(present),
      button({
        props: {
          type: 'submit',
          tabindex: '0'
        }
      }, ['Join Us!'])
    ]);
}

export function renderExpandedEvent(event: DevdayEvent, registrationSuccessUrl: string, present: boolean): VNode {
  const registrationSuccessful = registrationSuccessUrl === event.url;
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
      div('.agenda', [
        div('.content', { style: fadeInOutStyle }, [].concat.apply([], event.agenda.map(renderAgendaEntry)))
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
              div('.attending', [
                renderExpandedForm(event, registrationSuccessful, present)
              ])
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
}

interface EventDetailSinks {
  dom: Stream<VNode>;
  history: Stream<HistoryInput | string>;
  prevent: Stream<Event>;
}

export function EventDetailComponent(sources: EventDetailSources): EventDetailSinks {
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
  const vdom$ = event$.map(event => main([renderExpandedEvent(event, '', false)]));
  return {
    dom: vdom$,
    history: history$,
    prevent: shrinkButtonClick$
  }
}

export const EventDetail = (sources: EventDetailSources) => isolate(EventDetailComponent)(sources) as EventDetailSinks;
