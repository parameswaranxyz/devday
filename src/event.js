"use strict";
var dom_1 = require('@cycle/dom');
var definitions_1 = require('./definitions');
console.log(dom_1.span);
var fadeInOutStyle = {
    opacity: '0', delayed: { opacity: '1' }, remove: { opacity: '0' }
};
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function getHHMM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return (hours > 12 ? pad((hours - 12).toString(), 2) : pad(hours.toString(), 2)) + ':' + pad(minutes.toString(), 2);
}
function getMeridien(date) {
    return date.getHours() >= 12 ? 'PM' : 'AM';
}
function renderAgendaEntry(entry) {
    switch (entry.type) {
        case definitions_1.AgendaEntryType.Talk:
        case definitions_1.AgendaEntryType.Workshop:
            return [
                dom_1.div('.thumbnail', [
                    dom_1.h5([getHHMM(entry.time.start_time)]),
                    dom_1.h6([getMeridien(entry.time.start_time)])
                ]),
                dom_1.div('.info', [
                    dom_1.img('.avatar', {
                        props: {
                            src: entry.authors[0] != undefined
                                ? entry.authors[0].image_url || 'images/speakers/devday-speaker.png'
                                : 'images/speakers/devday-speaker.png'
                        }
                    }),
                    dom_1.h5(entry.title),
                    dom_1.h6(['by ' + entry.authors.map(function (a) { return a.name; }).join(', ')]),
                    dom_1.p(entry.abstract)
                ])
            ];
        case definitions_1.AgendaEntryType.Hackathon:
            return [
                dom_1.div('.thumbnail', [
                    dom_1.h5([getHHMM(entry.time.start_time)]),
                    dom_1.h6([getMeridien(entry.time.start_time)])
                ]),
                dom_1.div('.info', [
                    dom_1.h5(entry.title),
                    dom_1.p(entry.abstract)
                ])
            ];
        case definitions_1.AgendaEntryType.Break:
            return [
                dom_1.div('.thumbnail.break', [
                    dom_1.h5([getHHMM(entry.time.start_time)]),
                    dom_1.h6([getMeridien(entry.time.start_time)])
                ]),
                dom_1.div('.info.break', [
                    dom_1.div('.centerer', [
                        dom_1.h5(entry.title)
                    ])
                ])
            ];
    }
}
function renderBackground(event) {
    var style = {};
    if (event.color)
        style['background-color'] = event.color;
    if (event.image_url != undefined)
        style['background-image'] = "url(\"" + event.image_url + "\")";
    if (event.background_size != undefined)
        style['background-size'] = event.background_size;
    return dom_1.div('.background', { style: style });
}
function renderFormFields() {
    return [
        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
            dom_1.input('.mdl-textfield__input', {
                props: {
                    id: 'name',
                    placeholder: 'Name',
                    pattern: '^[a-zA-Z][a-zA-Z]+(\s[a-zA-Z]*)*$',
                    required: 'required'
                }
            }),
            dom_1.label('.mdl-textfield__label', {
                props: {
                    for: 'name'
                }
            }, ['Name']),
        ]),
        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
            dom_1.input('.mdl-textfield__input', {
                props: {
                    id: 'email',
                    placeholder: 'Email',
                    type: 'email',
                    required: 'required'
                }
            }),
            dom_1.label('.mdl-textfield__label', {
                props: {
                    for: 'email'
                }
            }, ['Email']),
            dom_1.span('mdl-textfield__error', {
                class: 'hidden',
                text: 'Enter a valid email!'
            })
        ]),
        dom_1.div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label', [
            dom_1.input('.mdl-textfield__input', {
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
            dom_1.label('.mdl-textfield__label', {
                props: {
                    for: 'mobile'
                }
            }, ['Mobile']),
        ]),
    ];
}
function renderExpandedForm(event) {
    var showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
    if (!showForm)
        return dom_1.p(['This event no longer accepts new registrations.']);
    return dom_1.form('.event.form', { style: fadeInOutStyle }, renderFormFields().concat([
        dom_1.button({
            props: {
                type: 'submit',
                tabindex: '0',
                onclick: function () { alert("Hello"); }
            }
        }, ['Join Us---!'])
    ]));
}
function renderForm(event, clicked) {
    var showForm = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
    if (!showForm)
        return [];
    if (!clicked)
        return [
            dom_1.a('.join.event.button', {
                props: {
                    title: 'join event',
                    href: '#'
                },
                attrs: {
                    'data-url': event.url
                },
                style: {
                    transform: 'scale(0)',
                    delayed: { transform: 'scale(1)' },
                    destroy: { transform: 'scale(0)' }
                },
            }, [
                dom_1.span('.hidden', 'join event'),
                dom_1.i('.material-icons', { style: { opacity: '0', delayed: { opacity: '1' } } }, 'add')
            ])];
    return [
        dom_1.a('.join.event.button', {
            props: {
                title: 'join event',
                href: '#'
            },
            attrs: {
                'data-url': event.url
            },
            style: {
                transform: 'scale(1)',
                delayed: { transform: 'scale3d(21, 21, 1)' },
                destroy: { transform: 'scale(1)' }
            },
        }, [
            dom_1.span('.hidden', 'join event')
        ]),
        dom_1.form('.event.form', { style: fadeInOutStyle }, [
            dom_1.button('.close', {
                style: {
                    float: 'right'
                },
                props: {
                    tabindex: '0'
                }
            }, 'x')
        ].concat(renderFormFields(), [
            dom_1.button({
                props: {
                    type: 'submit',
                    tabindex: '1'
                }
            }, ['Join Us---!'])
        ]))
    ];
}
function renderEvent(event, clicked) {
    var clickedBoolean = clicked === event.url;
    var authors = [].concat.apply([], event.agenda.filter(function (entry) { return Boolean(entry.authors) && Boolean(entry.authors.length); }).map(function (entry) { return entry.authors; }));
    return dom_1.article('.event.card', {
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
        dom_1.div('.primary.info', {
            style: {
                right: '100%',
                delayed: {
                    right: '35%'
                }
            }
        }, [
            dom_1.div('.content', {
                style: fadeInOutStyle
            }, [
                dom_1.h4([event.event_time.start_time.toDateString()]),
                dom_1.h3([event.title]),
                dom_1.p([event.abstract]),
            ])
        ]),
        renderBackground(event),
        dom_1.div('.speakers', {
            style: {
                top: '540px',
                delayed: {
                    top: '312px'
                }
            }
        }, [
            dom_1.div('.content', {
                style: fadeInOutStyle
            }, authors.length > 0
                ? authors.map(function (speaker) { return dom_1.img('.avatar', { props: { src: speaker.image_url || 'images/speakers/devday-speaker.png' } }); })
                : [dom_1.p(['There are no speakers at this event. Walk in for a hands-on experience!!!'])])
        ]),
        dom_1.div('.secondary.info', {
            style: {
                top: '540px',
                delayed: {
                    top: '440px'
                }
            }
        }, [
            dom_1.div('.content', {
                style: fadeInOutStyle
            }, [
                dom_1.div('.location', [
                    dom_1.address([
                        event.venue.locality + ',',
                        dom_1.br(),
                        event.venue.city
                    ]),
                    dom_1.a({ props: { href: event.venue.map_link } }, [
                        dom_1.div('.filler', {
                            attrs: {
                                style: "background-image: url(\"" + event.venue.map_image + "\");"
                            }
                        })
                    ])
                ]),
            ])
        ])
    ].concat(renderForm(event, clickedBoolean)));
}
exports.renderEvent = renderEvent;
function renderExpandedEvent(event) {
    return dom_1.article('.event.card.expanded', {
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
        dom_1.div('.primary.info', {
            style: {
                right: '100%',
                delayed: {
                    right: '35%'
                }
            }
        }, [
            dom_1.div('.content', {
                style: fadeInOutStyle
            }, [
                dom_1.h4([event.event_time.start_time.toDateString()]),
                dom_1.h3([event.title]),
                dom_1.p([event.abstract]),
            ])
        ]),
        renderBackground(event),
        dom_1.div('.agenda', [
            dom_1.div('.content', { style: fadeInOutStyle }, [].concat.apply([], event.agenda.map(renderAgendaEntry)))
        ]),
        dom_1.div('.secondary.info', {
            style: {
                top: '540px',
                delayed: {
                    top: '440px'
                }
            }
        }, [
            dom_1.div('.content', {
                style: fadeInOutStyle
            }, [
                dom_1.div('.location', [
                    dom_1.a({
                        props: {
                            target: '_blank',
                            href: event.venue.map_link
                        }
                    }, [
                        dom_1.div('.filler', {
                            attrs: {
                                style: "background-image: url(\"" + event.venue.map_image + "\");"
                            }
                        })
                    ]),
                    dom_1.address([
                        event.venue.line_one,
                        dom_1.br(),
                        event.venue.line_two,
                        dom_1.br(),
                        event.venue.locality,
                        dom_1.br(),
                        event.venue.city + ' - ' + event.venue.zip
                    ])
                ]),
                dom_1.div('.attending', [
                    renderExpandedForm(event)
                ])
            ]),
        ]),
        dom_1.a('.shrink.button', {
            props: {
                title: 'close event',
                href: '#'
            },
            style: {
                transform: 'scale(0)',
                delayed: { transform: 'scale(1)' },
                destroy: { transform: 'scale(0)' }
            },
        }, [
            dom_1.span('.hidden', 'close event'),
            dom_1.i('.material-icons', { style: { opacity: '0', delayed: { opacity: '1' } } }, 'close')
        ])
    ]);
}
exports.renderExpandedEvent = renderExpandedEvent;
//# sourceMappingURL=event.js.map