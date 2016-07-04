import "babel-polyfill";
import xs from 'xstream';
import { run } from '@cycle/xstream-run';
import { div, article, a, i, span, header, h4, h5, footer, makeDOMDriver } from '@cycle/dom';

function main({ dom }) {
	return {
		dom: xs.fromArray([0])
			.map(n =>
				div('.panel', window.events
					.sort((a, b) => new Date(b.time) - new Date(a.time))
					.map(event =>
						article('.centered', [
							div('.event.card', [
								a('.go.to.event.button', { props: { href: window.baseUrl + event.url } }, [
									i('.material-icons', 'arrow_forward'),
									span('.hidden', 'Go')
								]),
								header([
									h4([event.name])
								]),
								div('.content', [
									h5(event.time),
									event.abstract
								]),
								footer([
									i('.material-icons', 'label'),
									...event.tags.map(tag =>
										a('.tag', { props: { href: window.baseUrl + '/tags/' + tag.replace(' ', '-') } }, tag)
									),
									a('.right.button', { props: { href: window.baseUrl + event.Url } }, 'View Event')
								])
							])
						])
					))
			)
	};
}

run(main, { dom: makeDOMDriver('main') });