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
  }
};
