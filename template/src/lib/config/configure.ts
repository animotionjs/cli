import { configure } from '@animotion/core';

configure({
	theme: 'animotion-dark',
	transition: { type: 'slide', duration: 0.4 },
	aspectRatio: 'video',
	render: {
		fps: 60,
		resolution: '1080p'
	}
});
