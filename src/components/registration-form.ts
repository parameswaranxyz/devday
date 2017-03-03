import { DOMSource, VNode, p, div, form, button, input, label, span, textarea } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { Stream } from 'xstream';
import { RegistrationRequest } from '../drivers/registrations';
import { DevdayEvent, DevdayRegistrationData } from '../definitions';
import { fadeInOutStyle, closest } from '../utils';

interface RegistrationFormSources {
  dom: DOMSource;
  event$: Stream<DevdayEvent>;
  present$: Stream<boolean>;
  success$: Stream<boolean>;
}

interface RegistrationFormSinks {
  dom: Stream<VNode>;
  present$: Stream<boolean>;
  registrations: Stream<RegistrationRequest>;
  prevent: Stream<Event>;
}

// TODO: Refactor
function getFormData(form: HTMLFormElement): DevdayRegistrationData {
  const registration: DevdayRegistrationData = {
    name: form.elements['name'].value,
    email: form.elements['email'].value,
    mobile: form.elements['mobile'].value,
    present: form.elements['presentCheckbox'].checked
  };
  const titleElement: HTMLInputElement = form.elements['title'];
  if (!titleElement.classList.contains('hidden'))
    registration.title = titleElement.value;
  const abstractElement: HTMLTextAreaElement = form.elements['abstract'];
  if (!abstractElement.classList.contains('hidden'))
    registration.abstract = abstractElement.value;
  return registration;
}

function renderFormFields(present: boolean): VNode[] {
  const hidden = present ? '' : '.hidden';
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
    div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label' + hidden, [
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
    div('.form.text.input.element.mdl-js-textfield.mdl-textfield--floating-label' + hidden, [
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
  ];
}

function RegistrationFormComponent(sources: RegistrationFormSources): RegistrationFormSinks {
  const xs = Stream;
  const present$ =
    xs.merge(
      xs.of(false),
      sources.dom
        .select('#presentCheckbox')
        .events('change')
        .map(ev => (ev.target as HTMLInputElement).checked)
    );
  const formSubmit$ =
    sources.dom
      .select('.event.form button[type=submit]')
      .events('click');
  const registrations$ =
    sources.event$.map(event =>
      formSubmit$
        .filter(ev => {
          // TODO: Validate
          // TODO: Refactor
          const buttonElement = ev.currentTarget as HTMLButtonElement;
          const formElement = closest(buttonElement, 'form') as HTMLFormElement;
          const invalidElements = formElement.querySelectorAll('.is-invalid:not(.hidden)');
          return invalidElements.length === 0;
        })
        .map(ev => {
          // TODO: Refactor
          const buttonElement = ev.currentTarget as HTMLButtonElement;
          const formElement = closest(buttonElement, 'form') as HTMLFormElement;
          const cardElement = closest(formElement, '.event.card');
          const eventUrl = cardElement.attributes['data-url'].value;
          const request: RegistrationRequest = {
            event,
            data: getFormData(formElement)
          }
          return request;
        }))
      .flatten();
  const vdom$ =
    xs.combine(sources.event$, sources.present$, sources.success$)
      .map(([event, present, success]) => {
        present = present == undefined ? false : present;
        const allowed = event.form != undefined && event.registration_time.end_time.getTime() > new Date().getTime();
        if (!allowed)
          return p(['This event no longer accepts new registrations.']);
        if (success)
          return div('.registration.success', [
            p('.message', `Your registration was successful! See you on ${event.event_time.start_time.toDateString()}`)
          ]);
        return form('.event.form', { style: fadeInOutStyle }, [
          ...renderFormFields(present),
          button({
            props: {
              type: 'submit',
              tabindex: '0'
            }
          }, ['Join Us!'])
        ]);
      });
  return {
    dom: vdom$,
    present$,
    registrations: registrations$,
    prevent: formSubmit$
  };
}

export const RegistrationForm = (sources: RegistrationFormSources) => isolate(RegistrationFormComponent)(sources) as RegistrationFormSinks;
