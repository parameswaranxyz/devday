import { Stream } from 'xstream';
import { VNode, div, input, label, span } from '@cycle/dom';
import './styles.scss';

interface Sources {
  id$: Stream<string>;
  type$?: Stream<string>;
  pattern$?: Stream<string>;
  label$: Stream<string>;
  error$?: Stream<string>;
  required$: Stream<boolean>;
  maxLength$?: Stream<number>;
}

interface Sinks {
  dom: Stream<VNode>;
}

export const TextField = ({ id$, type$, pattern$, label$, error$, required$, maxLength$ }: Sources): Sinks => {
  type$ = type$ || Stream.of('text');
  pattern$ = pattern$ || Stream.of(undefined);
  error$ = error$ || Stream.of(undefined);
  maxLength$ = maxLength$ || Stream.of(undefined);
  const vdom$ =
    Stream
      .combine(id$, type$, pattern$, label$, error$, required$, maxLength$)
      .map(([id, type, pattern, labelString, error, required, maxLength ]) =>
        div('.text-field.mdl-js-textfield', [
          input('.mdl-textfield__input', { props: { type, pattern, id, required: required ? 'required' : '', maxLength } }),
          label('.mdl-textfield__label', { props: { for: id } }, [labelString]),
          !!error ? span('.mdl-textfield__error', [error]) : null
        ])
      );
  return {
    dom: vdom$
  };
};

