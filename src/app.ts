import { run } from '@cycle/run';
import main from './main';
import { makeDOMDriver } from '@cycle/dom';
import { makeRoutesDriver } from './drivers/router';
import { makeEventsDriver } from './drivers/events';
import { makePreventDriver } from './drivers/prevent';
import { makeMeetupsDriver } from './drivers/meetups';
import { makeRegistrationsDriver } from './drivers/registrations';

run(main, {
  dom: makeDOMDriver('#app'),
  routes: makeRoutesDriver(),
  events: makeEventsDriver(),
  prevent: makePreventDriver(),
  meetups: makeMeetupsDriver(),
  registrations: makeRegistrationsDriver()
});
