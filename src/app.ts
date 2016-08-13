import { run } from '@cycle/xstream-run';
import main from './main';
import { makeDOMDriver } from '@cycle/dom';
import { makeRoutesDriver } from './drivers/router';
import { makeEventsDriver } from './drivers/events';
import { makePreventDriver } from './drivers/prevent';

run(main, {
  dom: makeDOMDriver('#app'),
  routes: makeRoutesDriver(),
  events: makeEventsDriver(),
  prevent: makePreventDriver()
});
