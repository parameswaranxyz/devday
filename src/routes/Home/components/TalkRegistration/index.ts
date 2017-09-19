import { Stream } from 'xstream';
import { VNode, section, div, h4, a, form } from '@cycle/dom';
import { TextField } from '../../../../components/TextField';
import './styles.scss';

interface Sinks {
  dom: Stream<VNode>;
}

export const TalkRegistration = (): Sinks => {
  const nameDom$ = TextField({
    id$: Stream.of('talk-name'),
    error$: Stream.of('Please enter a valid name!'),
    label$: Stream.of('Name'),
    pattern$: Stream.of('^[a-zA-Z][a-zA-Z ]{4,}'),
    required$: Stream.of(true)
  }).dom;
  const mobileDom$ = TextField({
    id$: Stream.of('talk-mobile'),
    error$: Stream.of('Please enter a valid mobile!'),
    label$: Stream.of('Mobile'),
    pattern$: Stream.of('^[987][0-9]{9}$'),
    required$: Stream.of(true),
    maxLength$: Stream.of(10)
  }).dom;
  const vdom$ =
    Stream.combine(nameDom$, mobileDom$)
      .map(([nameDom, mobileDom]) => 
        section('.talk-registration', [
          div('.title', [
            h4(['Present your own idea'])
          ]),
          div('.content', [
            form([
              nameDom,
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
