import { Stream } from 'xstream';

export const routes = {
  '/': {
    getComponent: async () => {
      const { Home } = await import(/* webpackChunkName: "Home" */'./Home');
      return Home;
    }
  },
  '/archive': {
    getComponent: async () => {
      const { Archive } = await import(/* webpackChunkName: "Archive" */'./Archive');
      return Archive;
    }
  },
  '/events/:event_url': (event_url: string) => ({
    getComponent: async () => {
      const { EventDetail } = await import(/* webpackChunkName: "EventDetail" */'./EventDetail');
      return EventDetail;
    },
    sources: { eventUrl$: Stream.of(event_url) }
  })
};
