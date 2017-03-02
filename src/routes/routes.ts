import home from '../pages/home';
import { EventDetail } from '../pages/event-detail';
import { RouteResolution } from './definitions';
import { Stream } from 'xstream';

export const routes = {
  '/': { component: home } as RouteResolution,
  '/events/:event_url': (event_url: string) => ({ component: EventDetail, sources: { eventUrl$: Stream.of(event_url) } })
};
