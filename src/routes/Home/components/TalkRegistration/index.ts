import { Stream } from 'xstream';
import { VNode, section, div, h4, a, form, DOMSource } from '@cycle/dom';
import { TextField } from '../../../../components/TextField';
import { DevdayRegistrationData } from '../../../../definitions';
import { closestParent } from '../../../../utils';
import delay from 'xstream/extra/delay';
import { Snackbar } from '../../../../drivers/snackbars';
import { TalksSource } from '../../../../drivers/talks';
import './styles.scss';

interface Sources {
  dom: DOMSource;
  talks: TalksSource;
}

interface Sinks {
  dom: Stream<VNode>;
  material: Stream<boolean>;
  talks: Stream<DevdayRegistrationData>;
  snackbars: Stream<Snackbar>;
}

const getFormData = (form: HTMLFormElement): DevdayRegistrationData => ({
  name: form.elements['talk-name'].value,
  email: form.elements['talk-email'].value,
  mobile: form.elements['talk-mobile'].value,
  title: form.elements['talk-title'].value,
  abstract: form.elements['talk-abstract'].value,
});

export const TalkRegistration = ({ dom, talks }: Sources): Sinks => {
  const xs = Stream;
  const snackbar$ = talks.talk$.map<Snackbar>(({ success }) => ({
    message: success ? 'Talk submitted' : 'Talk submission failed',
    timeout: 5000
  }));
  const container = dom.select('.talk-registration');
  const interact$ =
    xs.merge(
      container.events('mouseover'),
      container.events('click'),
      container.events('touchstart')
    ).take(1);
  const submitClick$ = dom.select('.talk-submit').events('click', { preventDefault: true });
  const talk$ =
    submitClick$
      .compose(delay(250))
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
  const required$ = xs.merge(xs.of(false).compose(delay(1)), submitClick$.mapTo(true));
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
  return {
    dom: vdom$,
    talks: talk$,
    snackbars: snackbar$,
    material: xs.merge(interact$, required$).mapTo(true)
  };
};
