import { Sources, Sinks } from './definitions';
import home from './home';
import xs from 'xstream';

function main(sources: Sources): Sinks {
  return home(sources);
}

export default main;
