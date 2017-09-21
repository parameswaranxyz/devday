import { Stream } from 'xstream';
import { VNode, footer, div, a, span, p } from '@cycle/dom';
import delay from 'xstream/extra/delay';
import './styles.scss';

interface FooterSinks {
  dom: Stream<VNode>;
}

export const Footer = (): FooterSinks => {
  const vtree$ = Stream.of(footer([
    div('.left.section', [
      a('.twitter.social.button', {
        props: {
          href: 'https://twitter.com/devday_',
          target: '_blank'
        }
      }, [
          span('.hidden', 'twitter')
        ]),
      a('.facebook.social.button', {
        props: {
          href: 'https://facebook.com/d3vday',
          target: '_blank'
        }
      }, [
          span('.hidden', 'facebook')
        ])
    ]),
    div('.right.section', [
      p([
        '© 2016 - Organised by ',
        a('.sahaj.org.link', {
          props: {
            href: 'https://sahajsoft.com',
            target: '_blank'
          }
        }, 'Sahaj Software Solutions')
      ])
    ])
  ])).compose(delay(500))
  .startWith(footer());
  return {
    dom: vtree$
  };
};
