import { Stream } from 'xstream';
import { VNode, section, div, h4, a, form } from '@cycle/dom';
import './styles.scss';

interface Sinks {
  dom: Stream<VNode>;
}

export const TalkRegistration = (): Sinks => {
  const vdom$ = Stream.of(
    section('.talk-registration', [
      div('.title', [
        h4(['Present your own idea'])
      ]),
      div('.content', [
        form([
          
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
