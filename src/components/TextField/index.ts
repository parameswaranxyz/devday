import { Stream } from 'xstream';
import { VNode, div, input, textarea, label, span } from '@cycle/dom';
import './styles.scss';

interface Sources {
  id$: Stream<string>;
  type$?: Stream<string>;
  pattern$?: Stream<string>;
  label$: Stream<string>;
  error$?: Stream<string>;
  required$?: Stream<boolean>;
  maxLength$?: Stream<number>;
  rows$?: Stream<number>;
}

interface Sinks {
  dom: Stream<VNode>;
}

export const TextField = ({ id$, type$, pattern$, label$, error$, required$, maxLength$, rows$ }: Sources): Sinks => {
  type$ = type$ || Stream.of('text');
  pattern$ = pattern$ || Stream.of(undefined);
  error$ = error$ || Stream.of(undefined);
  maxLength$ = maxLength$ || Stream.of(undefined);
  rows$ = rows$ || Stream.of(1);
  required$ = required$ || Stream.of(false);
  const vdom$ =
    Stream
      .combine(id$, type$, pattern$, label$, error$, required$, maxLength$, rows$)
      .map(([id, type, pattern, labelString, error, required, maxLength, rows ]) =>
        div('.text-field.mdl-js-textfield', [
          rows == 1
            ? input('.mdl-textfield__input', { props: { type, pattern, id, required: required ? 'required' : '', maxLength } })
            : textarea('.mdl-textfield__input', { props: { id, required: required ? 'required' : '', maxLength, rows } }),
          label('.mdl-textfield__label', { attrs: { for: id } }, [labelString]),
          !!error ? span('.mdl-textfield__error', [error]) : null
        ])
      );
  return {
    dom: vdom$
  };
};

