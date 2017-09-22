import { run } from '@cycle/run';
import { main } from './main';
import { makeDOMDriver } from '@cycle/dom';
import { makeEventsDriver } from './drivers/events';
import { makeMeetupsDriver } from './drivers/meetups';
import { makeRegistrationsDriver } from './drivers/registrations';
import { makeHashHistoryDriver } from '@cycle/history';
import { makeMaterialDriver } from './drivers/material';
import { makeTalksDriver } from './drivers/talks';
import { makeSnackbarsDriver } from './drivers/snackbars';

run(main, {
  dom: makeDOMDriver('#root'),
  events: makeEventsDriver(),
  registrations: makeRegistrationsDriver(),
  history: makeHashHistoryDriver() as any,
  material: makeMaterialDriver(),
  meetups: makeMeetupsDriver(),
  talks: makeTalksDriver(),
  snackbars: makeSnackbarsDriver()
});
