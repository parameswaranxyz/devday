import { Stream } from 'xstream';
import { VNode, section, div, h4, a, form } from '@cycle/dom';
import { TextField } from '../../../../components/TextField';
import './styles.scss';

interface Sinks {
  dom: Stream<VNode>;
}

export const TalkRegistration = (): Sinks => {
  const titleDom$ = TextField({
    id$: Stream.of('talk-title'),
    error$: Stream.of('Please enter a title!'),
    label$: Stream.of('Title')
  }).dom;
  const abstractDom$ = TextField({
    id$: Stream.of('talk-abstract'),
    error$: Stream.of('Please enter an abstract!'),
    label$: Stream.of('Abstract'),
    rows$: Stream.of(5)
  }).dom;
  const nameDom$ = TextField({
    id$: Stream.of('talk-name'),
    error$: Stream.of('Please enter a valid name!'),
    label$: Stream.of('Name'),
    pattern$: Stream.of('^[a-zA-Z][a-zA-Z ]{4,}')
  }).dom;
  const emailDom$ = TextField({
    id$: Stream.of('talk-email'),
    error$: Stream.of('Please enter a valid email!'),
    label$: Stream.of('Email'),
    type$: Stream.of('email')
  }).dom;
  const mobileDom$ = TextField({
    id$: Stream.of('talk-mobile'),
    error$: Stream.of('Please enter a valid mobile!'),
    label$: Stream.of('Mobile'),
    pattern$: Stream.of('^[987][0-9]{9}$'),
    maxLength$: Stream.of(10)
  }).dom;
  const vdom$ =
    Stream.combine(titleDom$, abstractDom$, nameDom$, emailDom$, mobileDom$)
      .map(([titleDom, abstractDom, nameDom, emailDom, mobileDom]) => 
        section('.talk-registration', [
          div('.title', [
            h4(['Present your own idea'])
          ]),
          div('.content', [
            form([
              titleDom,
              abstractDom,
              nameDom,
              emailDom,
              mobileDom
            ])
          ]),
          div('.footer', [
            a('.mdl-js-button.mdl-js-ripple-effect', ['Submit'])
          ])
        ])
      );
  return {
    dom: vdom$
  };
};
