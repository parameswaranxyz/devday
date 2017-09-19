import { Stream } from 'xstream';
import { VNode, section, div, h4, a, form, DOMSource } from '@cycle/dom';
import { TextField } from '../../../../components/TextField';
import { DevdayRegistrationData } from '../../../../definitions';
import { closestParent } from '../../../../utils';
import dropRepeats from 'xstream/extra/dropRepeats';
import delay from 'xstream/extra/delay';
import './styles.scss';

interface Sources {
  dom: DOMSource;
}

interface Sinks {
  dom: Stream<VNode>;
  prevent: Stream<Event>;
  talks: Stream<DevdayRegistrationData>;
}

const getFormData = (form: HTMLFormElement): DevdayRegistrationData => ({
  name: form.elements['talk-name'].value,
  email: form.elements['talk-email'].value,
  mobile: form.elements['talk-mobile'].value,
  title: form.elements['talk-title'].value,
  abstract: form.elements['talk-abstract'].value,
});

export const TalkRegistration = ({ dom }: Sources): Sinks => {
  const submitClick$ = dom.select('.talk-submit').events('click');
  const talk$ =
    submitClick$
      .compose(delay(50))
      .filter(ev => {
        // TODO: Validate
        const buttonElement = ev.currentTarget as HTMLButtonElement;
        const formElement = closestParent(buttonElement, 'form') as HTMLFormElement;
        const invalidElements = formElement.querySelectorAll('.is-invalid');
        return invalidElements.length === 0;
      })
      .map(ev => {
        const buttonElement = ev.currentTarget as HTMLButtonElement;
        const formElement = closestParent(buttonElement, 'form') as HTMLFormElement;
        const data = getFormData(formElement);
        return data;
      });
  const required$ = submitClick$.mapTo(true).startWith(false).take(2);
  const titleDom$ = TextField({
    id$: Stream.of('talk-title'),
    error$: Stream.of('Please enter a title!'),
    label$: Stream.of('Title'),
    required$
  }).dom;
  const abstractDom$ = TextField({
    id$: Stream.of('talk-abstract'),
    error$: Stream.of('Please enter an abstract!'),
    label$: Stream.of('Abstract'),
    rows$: Stream.of(5),
    required$
  }).dom;
  const nameDom$ = TextField({
    id$: Stream.of('talk-name'),
    error$: Stream.of('Please enter a valid name!'),
    label$: Stream.of('Name'),
    pattern$: Stream.of('^[a-zA-Z][a-zA-Z ]{4,}'),
    required$
  }).dom;
  const emailDom$ = TextField({
    id$: Stream.of('talk-email'),
    error$: Stream.of('Please enter a valid email!'),
    label$: Stream.of('Email'),
    type$: Stream.of('email'),
    required$
  }).dom;
  const mobileDom$ = TextField({
    id$: Stream.of('talk-mobile'),
    error$: Stream.of('Please enter a valid mobile!'),
    label$: Stream.of('Mobile'),
    pattern$: Stream.of('^[987][0-9]{9}$'),
    maxLength$: Stream.of(10),
    required$
  }).dom;
  const vdom$ =
    Stream.combine(titleDom$, abstractDom$, nameDom$, emailDom$, mobileDom$)
      .map(([titleDom, abstractDom, nameDom, emailDom, mobileDom]) =>
        form('.talk-registration', [
          div('.title', [
            h4(['Present your own idea'])
          ]),
          div('.content', [
            titleDom,
            abstractDom,
            nameDom,
            emailDom,
            mobileDom
          ]),
          div('.footer', [
            a('.talk-submit.mdl-js-button.mdl-js-ripple-effect', ['Submit'])
          ])
        ])
      );
  required$.compose(delay(30)).addListener({
    next: () =>
      [].slice.call(document.querySelectorAll('.talk-registration'))
        .filter(Boolean)
        .map(form => [].slice.call(form.querySelectorAll('.mdl-js-textfield')))
        .map(textFields => textFields.map(element => element.MaterialTextfield).filter(Boolean))
        .forEach(fields => fields.forEach(field => field.init())),
    error: () => { },
    complete: () => { }
  });
  return {
    dom: vdom$,
    prevent: submitClick$,
    talks: talk$
  };
};
