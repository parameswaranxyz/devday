import { run } from '@cycle/xstream-run';
import main from './main';
import { makeRoutesDriver } from './router';
import { makeDOMDriver } from '@cycle/dom';

run(main, {
    dom: makeDOMDriver('body'),
    routes: makeRoutesDriver()
});