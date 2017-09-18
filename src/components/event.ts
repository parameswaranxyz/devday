import { Stream } from 'xstream';
import { div, article, a, img, i, span, header, nav, main, section, h4, h5, h6, footer, form, label, input, textarea, button, h3, p, address, br, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, AgendaEntry, AgendaEntryType, DevdayEvent, Author } from '../definitions';

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
            required : 'required'
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
            required : 'required'
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
    },[
      input('#presentCheckbox', { attrs: { type: 'checkbox' } }),
      'I want to present a talk/workshop'
    ]),
    ...presentFields
  ];
}

function renderForm(event: DevdayEvent, clicked: boolean, shorten: boolean, registrationSuccessful: boolean, present: boolean): VNode[] {
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
    registrationSuccessful
      ? div('.registration.success', [
        h4('.message', ['Your registration was successful!', br(), `See you on ${event.event_time.start_time.toDateString()}`]),
        button('.close .mdl-button', {
          style : {
            color : '#ff4081',
            background : 'white'
          },
          props: {
            tabindex: '0'
          }
        }, 'Close')
      ])
      : form('.event.form', { style: fadeInOutStyle }, [
        button('.close', {
          style: {
            float: 'right'
          },
          props: {
            tabindex: '0'
          }
        }, 'x'),
        ...renderFormFields(present),
        button({
          props: {
            type: 'submit',
            tabindex: '1'
          }
        }, ['Join Us!'])
      ])
  ]
}

const renderAttending = (event: DevdayEvent): VNode => {
  const { attending } = event;
  return div('.attending', [
    p([`${!!attending ? `${attending} registrations.` : 'Registration data unavailable.'}`])
  ]);
};

export function renderEvent(event: DevdayEvent, joinUrl: string, shorten: boolean, registrationSuccessfulUrl: string, present: boolean): VNode {
  const clickedBoolean = joinUrl === event.url;
  const registrationSuccessful = registrationSuccessfulUrl === event.url;
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
          div('.content', { style: fadeInOutStyle }, [
              h5('.location', [
                i(".material-icons detail-icon", "location_on"),
                event.venue.city
              ]),
              h4('', [
                i(".material-icons detail-icon", "event"),
                event.event_time.start_time.toDateString()
              ]),
              h3([event.title]),
              p([event.abstract])
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
              ? authors.map(speaker => a('.link', { props: { href: speaker.linkedin_profile_url || "#", target: "_blank"}}, [img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } })]))
              : [p(['Walk in with your laptops for a hands-on experience!!!'])]
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
              renderAttending(event)
            ])
        ]),
      ...renderForm(event, clickedBoolean, shorten, registrationSuccessful, present)
    ]);
}
