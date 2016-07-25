import { Stream } from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, article, a, img, i, span, header, nav, main, h4, h5, footer, makeDOMDriver, VNode } from '@cycle/dom';
import { Sources, Sinks, BaseUrlProvider } from './definitions';

function getDisplayTime(date: Date) {
  var timeSplits = date.toString().split(' ');
  return timeSplits[2] + ' ' + timeSplits[1] + ' ' + timeSplits[3];
}

function renderHeader(baseUrl: string): VNode {
  return header([
    div('.container', [
      div('.content', [
        a('.title', { props: { href: baseUrl + '/' } }, [
          img({ props: { src: baseUrl + 'images/logo.gif' } })
        ]),
        div('.navigation.container', [
          nav([
            a({ props: { href: baseUrl + '/archive/' } }, 'Archive')
          ])
        ])
      ])
    ])
  ]);
}

function archive(sources: Sources): Sinks {
  const route$ = sources.routes.route$;
  const events$ = sources.events.events$;
  const baseUrl = (window as BaseUrlProvider).baseUrl;
  const currentDate = new Date();
  const vdom$ =
    route$
      .filter(url => url === 'archive')
      .map(route =>
        events$.map(events =>
          div('.devday.archive', [
            div('.container', [
              div('.layout', [
                renderHeader(baseUrl),
                main([
                  div('.panel', events
                    .filter(event => event.event_time.start_time - currentDate < 0)
                    .sort((a, b) => b.event_time.start_time - a.event_time.start_time)
                    .map(event =>
                      article('.centered', [
                        div('.event.card', [
                          a('.go.to.event.button', { props: { href: baseUrl + event.url } }, [
                            i('.material-icons', 'arrow_forward'),
                            span('.hidden', 'Go')
                          ]),
                          header([
                            h4([event.title])
                          ]),
                          div('.content', [
                            h5(getDisplayTime(event.event_time.start_time)),
                            event.abstract
                          ]),
                          footer([
                            i('.material-icons', 'label'),
                            ...event.tags.map(tag =>
                              a('.tag', { props: { href: baseUrl + '/tags/' + tag.replace(' ', '-') } }, tag)
                            ),
                            a('.right.button', { props: { href: baseUrl + event.url } }, 'View Event')
                          ])
                        ])
                      ])
                    ))
                ])
              ])
            ])
          ])
        )
      ).flatten();

  return {
    dom: vdom$,
    routes: null,
    events: null
  };
}

export default archive;
