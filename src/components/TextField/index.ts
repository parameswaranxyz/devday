import { Stream } from 'xstream';
import { VNode, div, input, textarea, label, span, DOMSource } from '@cycle/dom';
import './styles.scss';

interface Sources {
  dom: DOMSource;
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
  value$: Stream<string>;
  valid$: Stream<boolean>;
}

export const TextField = ({ dom, id$, type$, pattern$, label$, error$, required$, maxLength$, rows$ }: Sources): Sinks => {
  const xs = Stream;
  type$ = type$ || Stream.of('text');
  pattern$ = pattern$ || Stream.of(undefined);
  error$ = error$ || Stream.of(undefined);
  maxLength$ = maxLength$ || Stream.of(undefined);
  rows$ = rows$ || Stream.of(1);
  required$ = required$ || Stream.of(false);
  const input$ =
    id$
      .map(id => dom.select('#' + id).events('input'))
      .flatten()
      .map(event => (event.target as HTMLInputElement));
  const value$ = input$.map(input => input.value).startWith(undefined);
  const valid$ =
    required$
      .map(() => input$.map(input => input.validity.valid).startWith(false))
      .flatten();
  const vdom$ =
    Stream
      .combine(id$, type$, pattern$, label$, error$, required$, maxLength$, rows$)
      .map(([id, type, pattern, labelString, error, required, maxLength, rows]) =>
        div('.text-field.mdl-js-textfield', [
          rows == 1
            ? input('.mdl-textfield__input', { props: { type, pattern, id, required: required ? 'required' : '', maxLength } })
            : textarea('.mdl-textfield__input', { props: { id, required: required ? 'required' : '', maxLength, rows } }),
          label('.mdl-textfield__label', { attrs: { for: id } }, [labelString]),
          !!error ? span('.mdl-textfield__error', [error]) : null
        ])
      );
  return {
    dom: vdom$,
    valid$,
    value$
  };
};

