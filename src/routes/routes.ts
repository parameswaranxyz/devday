import { Home } from './Home';
import { EventDetail } from './EventDetail';
import { RouteResolution } from './definitions';
import { Stream } from 'xstream';

export const routes = {
  '/': { component: Home } as RouteResolution,
  '/events/:event_url': (event_url: string) => ({ component: EventDetail, sources: { eventUrl$: Stream.of(event_url) } })
};
