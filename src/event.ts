import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, article, a, img, i, span, header, nav, main, section, h4, h5, h6, footer, form, label, input, button, h3, p, address, br, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, AgendaEntry, AgendaEntryType, DevdayEvent, Author } from './definitions';

const fadeInOutStyle = {
  opacity: '0', delayed: { opacity: '1' }
};

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
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

function renderAgendaEntry(entry: AgendaEntry): VNode[] {
  switch (entry.type) {
    case AgendaEntryType.Talk:
    case AgendaEntryType.Workshop:
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
          p(entry.abstract)
        ])
      ];
    case AgendaEntryType.Hackathon:
      return [
        div('.thumbnail', [
          h5([getHHMM(entry.time.start_time)]),
          h6([getMeridien(entry.time.start_time)])
        ]),
        div('.info', [
          h5(entry.title),
          p(entry.abstract)
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

function renderFormFields(): VNode[] {
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
    // p('Please fill out the following in case you want to present a talk/workshop'),
    // div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
    //   input('.mdl-textfield__input', {
    //     props: {
    //       id: 'title',
    //       placeholder: 'Title'
    //     }
    //   }),
    //   label('.mdl-textfield__label', {
    //     props: {
    //       for: 'title'
    //     }
    //   }, ['Title'])
    // ]),
    // div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
    //   input('.mdl-textfield__input', {
    //     props: {
    //       id: 'abstract',
    //       placeholder: 'Abstract'
    //     }
    //   }),
    //   label('.mdl-textfield__label', {
    //     props: {
    //       for: 'abstract'
    //     }
    //   }, ['Abstract'])
    // ]),
  ];
}

function renderExpandedForm(event: DevdayEvent): VNode {
  const showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
  if (!showForm)
    return p(['This event no longer accepts new registrations.']);
  return form('.event.form', [
    ...renderFormFields(),
    button({
      props: {
        type: 'submit',
        tabindex: '0'
      }
    }, ['Join Us!'])
  ]);
}

function renderForm(event: DevdayEvent, clicked: boolean, shorten: boolean): VNode[] {
  const showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
  const buttonSelector = '.join.event.button' + (shorten ? '' : '.no.delay');
  if (!showForm)
    return [];
  if (!clicked)
    return [
      a(buttonSelector, {
        props: {
          title: 'join event',
          href: '#'
        },
        style: {
          transform: 'scale3d(0, 0, 1)',
          delayed: {
            transform: 'scale3d(1,1,1)'
          }
        },
        attrs: {
          'data-url': event.url
        }
      }, [
          span('.hidden', 'join event'),
          i('.material-icons.join.icon', { style: fadeInOutStyle }, 'add')
        ])];
  return [
    a('.join.event.button', {
      props: {
        title: 'join event',
        href: '#'
      },
      style: {
        transform: 'scale3d(1, 1, 1)',
        delayed: {
          transform: 'scale3d(21,21,1)'
        }
      },
      attrs: {
        'data-url': event.url
      }
    }, [
        span('.hidden', 'join event')
      ]),
    form('.event.form', { style: fadeInOutStyle }, [
      button('.close', {
        style: {
          float: 'right'
        },
        props: {
          tabindex: '0'
        }
      }, 'x'),
      ...renderFormFields(),
      button({
        props: {
          type: 'submit',
          tabindex: '1'
        }
      }, ['Join Us!'])
    ])
  ]
}

export function renderEvent(event: DevdayEvent, clicked: string, shorten: boolean): VNode {
  const clickedBoolean = clicked === event.url;
  const authors: Author[] = [].concat.apply([], event.agenda.filter(entry => Boolean(entry.authors) && Boolean(entry.authors.length)).map(entry => entry.authors));
  return article('.event.card', {
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
              span('.animated shake', [
                "Details",
                i('.material-icons', ["trending_flat"])
              ])
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
          }, authors.length > 0
              ? authors.map(speaker => img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } }))
              : [p(['There are no speakers at this event. Walk in for a hands-on experience!!!'])]
          )
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
              // div('.attending', [
              //   p([event.attending != undefined ? `${event.attending} attending` : 'JOIN NOW'])
              // ])
            ])
        ]),
      ...renderForm(event, clickedBoolean, shorten)
    ]);
}

export function renderExpandedEvent(event: DevdayEvent): VNode {
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
                renderExpandedForm(event)
              ])
            ]),
        ]),
      a('.shrink.button', {
        props: {
          title: 'close event',
          href: '#'
        }
      }, [
          span('.hidden', 'close event'),
          i('.material-icons', 'close')
        ])
    ]);
}
