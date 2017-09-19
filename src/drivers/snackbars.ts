import { Stream } from 'xstream';
import { div, button } from '@cycle/dom';

export interface Snackbar {
  message: string;
  timeout?: number;
  actionHandler?: () => void;
  actionText?: string;
}

export class SnackbarsSource {
  constructor(snackbar$: Stream<Snackbar>) {
    const noop = () => { };
    snackbar$.addListener({
      next: snackbar => {
        const snackbarContainer = document.querySelector('#snackbar-container');
        if (snackbarContainer == undefined) return;
        (<any>snackbarContainer).MaterialSnackbar.showSnackbar(snackbar);
      },
      error: noop,
      complete: noop
    });
  }
}

export const renderSnackbar = () =>
  div('#snackbar-container.mdl-js-snackbar.mdl-snackbar', [
    div('.mdl-snackbar__text'),
    button('.mdl-snackbar__action')
  ]);

export const makeSnackbarsDriver = () => (snackbar$: Stream<Snackbar>) => new SnackbarsSource(snackbar$);
