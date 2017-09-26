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
  // Hack to enable material validation on click of submit, cannot be removed.
  // https://github.com/google/material-design-lite/issues/1502
  submitClick$
    .compose(delay(50))
    .addListener({
      next: ev =>
        [].slice
          .call(closestParent(ev.target as HTMLButtonElement, 'form').querySelectorAll('.mdl-js-textfield'))
          .map(element => element.MaterialTextfield)
          .filter(Boolean)
          .forEach(field => field.init())
    });
  const required$ = xs.merge(xs.of(false).compose(delay(1)), submitClick$.mapTo(true)).take(2);
  const title = TextField({
    dom,
    id$: Stream.of('talk-title'),
    error$: Stream.of('Please enter a title!'),
    label$: Stream.of('Title'),
    required$
  });
  const abstract = TextField({
    dom,
    id$: Stream.of('talk-abstract'),
    error$: Stream.of('Please enter an abstract!'),
    label$: Stream.of('Abstract'),
    rows$: Stream.of(5),
    required$
  });
  const name = TextField({
    dom,
    id$: Stream.of('talk-name'),
    error$: Stream.of('Please enter a valid name!'),
    label$: Stream.of('Name'),
    pattern$: Stream.of('^[a-zA-Z][a-zA-Z ]{4,}'),
    required$
  });
  const email = TextField({
    dom,
    id$: Stream.of('talk-email'),
    error$: Stream.of('Please enter a valid email!'),
    label$: Stream.of('Email'),
    type$: Stream.of('email'),
    required$
  });
  const mobile = TextField({
    dom,
    id$: Stream.of('talk-mobile'),
    error$: Stream.of('Please enter a valid mobile!'),
    label$: Stream.of('Mobile'),
    pattern$: Stream.of('^[987][0-9]{9}$'),
    maxLength$: Stream.of(10),
    required$
  });
  const valid$ =
    xs.combine(title.valid$, abstract.valid$, name.valid$, email.valid$, mobile.valid$)
      .map(validities => validities.every(valid => !!valid));
  const talk$ =
    xs.combine(title.value$, abstract.value$, name.value$, email.value$, mobile.value$)
      .map(([title, abstract, name, email, mobile]) =>
        valid$.map(valid =>
          submitClick$
            .filter(ev => valid)
            .map(() => ({ title, abstract, name, email, mobile } as DevdayRegistrationData))
        ).flatten()
      ).flatten();
  const vdom$ =
    Stream.combine(title.dom, abstract.dom, name.dom, email.dom, mobile.dom)
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
    material: xs.merge(interact$.mapTo(true), required$.mapTo(true))
  };
};
