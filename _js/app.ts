import { run } from '@cycle/xstream-run';
import main from './main';
import { makeDOMDriver } from '@cycle/dom';
import { makeRoutesDriver } from './router';
import { makeEventsDriver } from './events';

run(main, {
  dom: makeDOMDriver('body'),
  routes: makeRoutesDriver(),
  events: makeEventsDriver()
});
