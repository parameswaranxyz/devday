import "babel-polyfill";
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, header, h1, span, img, h2, main, article, a, i, nav, button, footer, makeDOMDriver } from '@cycle/dom';

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];

function home({ dom }) {
  const noun$ = xs.periodic(1000)
    .map(x => x % nouns.length)
    .map(i => nouns[i]);
  const topic$ = xs.periodic(4000)
    .map(x => x % topics.length)
    .map(i => topics[i]);
  const vtree$ = xs.combine(noun$, topic$)
    .map(x => {
      const noun = x[0];
      const topic = x[1];
      return div('.content', [
        header([
          h1([
            span('.hidden', 'devday_'),
            img({ props: { src: window.baseUrl + '/images/logo.gif' } })
          ]),
          h2([`a monthly informal event for developers to share their ${noun} about ${topic}`])
        ]),
        main([
          // TODO: two upcoming events, design
          article('.upcoming.event.card', [
            a('.go.to.event.button', { props: { title: 'go to event' } }, [
              span('.hidden', 'go to event'),
              i('.material-icons', 'keyboard_arrow_right')
            ])
          ]),
          nav([
            a({ props: { href: window.baseUrl + '/archive', title: 'view all previous events' } }, [
              'More',
              button([
                i('.material-icons', { props: { role: 'presentation' } }, 'arrow_forward')
              ])
            ])
          ])
        ]),
        footer([
          div('.left.section', [
            button('.twitter.social.button', [
              span('.hidden', 'twitter')
            ]),
            button('.facebook.social.button', [
              span('.hidden', 'facebook')
            ]),
            button('.google.plus.social.button', [
              span('.hidden', 'google plus')
            ])
          ]),
          div('.right.section',[
            button('.share.social.button',[
              i('.material-icons', { props: { role: 'presentation' } }, 'share'),
              span('.hidden', 'share')
            ])
          ])
        ])
      ])
    })

  return {
    dom: vtree$
  };
}

run(home, { dom: makeDOMDriver('.devday.home>.container>.layout') });