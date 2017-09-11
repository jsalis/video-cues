
import CueList from '../src/cue-list';
import VideoMock from './video-mock';

describe('CueList', () => {

	let video, cueList, handler;

	beforeEach(() => {
		video = VideoMock.create();
		cueList = CueList.create(video);
		handler = jasmine.createSpy('handler');
		jasmine.clock().install();
	});

	afterEach(() => {
		jasmine.clock().uninstall();
	});

	it('must return an object', () => {
		expect(CueList.create(video)).toEqual(jasmine.any(Object));
	});

	describe('trigger', () => {

		it('must defer the callback of the cue point', () => {
			cueList.add(0, handler);
			video.duration = 1;
			video.currentTime = 0;
			video.dispatchEvent({ type: 'timeupdate' });
			expect(handler).not.toHaveBeenCalled();
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalled();
		});

		it('must trigger cue points on the "playing" event', () => {
			cueList.add(0, handler);
			video.duration = 1;
			video.currentTime = 0;
			video.dispatchEvent({ type: 'playing' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalled();
		});

		it('must trigger cue points with a numeric offset', () => {
			let firstHandler = jasmine.createSpy('firstHandler');
			let secondHandler = jasmine.createSpy('secondHandler');
			cueList.add(4.25, firstHandler);
			cueList.add('13.52', secondHandler);
			video.duration = 15;
			video.currentTime = 4.25;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).toHaveBeenCalled();
			expect(secondHandler).not.toHaveBeenCalled();
			firstHandler.calls.reset();
			secondHandler.calls.reset();
			video.currentTime = 13.52;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).not.toHaveBeenCalled();
			expect(secondHandler).toHaveBeenCalled();
		});

		it('must trigger cue points with a percentage offset', () => {
			let firstHandler = jasmine.createSpy('firstHandler');
			let secondHandler = jasmine.createSpy('secondHandler');
			cueList.add('25%', firstHandler);
			cueList.add('50%', secondHandler);
			video.duration = 15;
			video.currentTime = 3.75;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).toHaveBeenCalled();
			expect(secondHandler).not.toHaveBeenCalled();
			firstHandler.calls.reset();
			secondHandler.calls.reset();
			video.currentTime = 7.5;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).not.toHaveBeenCalled();
			expect(secondHandler).toHaveBeenCalled();
		});

		it('must not trigger a cue point before the offset', () => {
			cueList.add(1, handler);
			video.duration = 10;
			video.currentTime = 0.99;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).not.toHaveBeenCalled();
		});

		it('must not trigger the same cue point more than once', () => {
			cueList.add(0.5, handler);
			video.duration = 10;
			video.currentTime = 0.5;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			video.currentTime = 0.6;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledTimes(1);
		});

		it('must not trigger the same cue point when multiple video events are handled', () => {
			cueList.add(1, handler);
			video.duration = 10;
			video.currentTime = 1;
			video.dispatchEvent({ type: 'playing' });
			video.dispatchEvent({ type: 'timeupdate' });
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(100);
			expect(handler).toHaveBeenCalledTimes(1);
		});

		it('must trigger all cue points with an offset less than the current time', () => {
			cueList.add([ 3, 2, 1 ], handler);
			video.duration = 10;
			video.currentTime = 10;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledTimes(3);
		});

		it('must pass the cue point offset to the handler', () => {
			cueList.add([ 4, '50%' ], handler);
			video.duration = 30;
			video.currentTime = 4;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledWith(
				jasmine.objectContaining({
					offset: 4
				})
			);
			video.currentTime = 15;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledWith(
				jasmine.objectContaining({
					offset: '50%'
				})
			);
		});

		it('must handle an unknown video duration', () => {
			cueList.add([ 3, '10%' ], handler);
			video.duration = NaN;
			video.currentTime = 3;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith(
				jasmine.objectContaining({
					offset: 3
				})
			);
		});
	});

	describe('add', () => {

		it('must add a single cue point', () => {
			cueList.add(16.6, handler);
			expect(cueList.offsets()).toEqual([ 16.6 ]);
		});

		it('must add multiple cue points', () => {
			cueList.add([ 2, 4, 8, '50%' ], handler);
			expect(cueList.offsets()).toEqual([ 2, 4, 8, '50%' ]);
		});
	});

	describe('remove', () => {

		it('must remove all cue points with the given offsets', () => {
			cueList.add([ 0, 1 ], handler);
			cueList.add([ 2, 3 ], handler);
			cueList.remove(0);
			cueList.remove([ 1, 2 ]);
			expect(cueList.offsets()).toEqual([ 3 ]);
		});

		it('must remove all cue points when an offset is not passed', () => {
			cueList.add([ 0, 1 ], handler);
			cueList.add([ 2, 3 ], handler);
			cueList.remove();
			expect(cueList.offsets()).toEqual([]);
		});
	});

	describe('offsets', () => {

		it('must return all cue point offsets', () => {
			cueList.add([ 0, 1 ], handler);
			cueList.add([ 2, 3 ], handler);
			expect(cueList.offsets()).toEqual([ 0, 1, 2, 3 ]);
		});
	});

	describe('disable', () => {

		it('must disable all cue points', () => {
			cueList.add([ 0, 1, 2 ], handler);
			cueList.disable();
			video.duration = 10;
			video.currentTime = 10;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe('enable', () => {

		it('must enable all cue points', () => {
			cueList.add([ 0, 1, 2 ], handler);
			cueList.disable();
			cueList.enable();
			video.duration = 10;
			video.currentTime = 10;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).toHaveBeenCalledTimes(3);
		});
	});

	describe('reset', () => {

		it('must reset all cue points', () => {
			let firstHandler = jasmine.createSpy('firstHandler');
			let secondHandler = jasmine.createSpy('secondHandler');
			cueList.add(1, firstHandler);
			cueList.add(2, secondHandler);
			video.duration = 10;
			video.currentTime = 10;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).toHaveBeenCalled();
			expect(secondHandler).toHaveBeenCalled();
			cueList.reset();
			firstHandler.calls.reset();
			secondHandler.calls.reset();
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(firstHandler).toHaveBeenCalled();
			expect(secondHandler).toHaveBeenCalled();
		});
	});

	describe('dispose', () => {

		it('must remove all cue points', () => {
			cueList.add([ 0, 1, 2 ], handler);
			cueList.dispose();
			video.duration = 10;
			video.currentTime = 10;
			video.dispatchEvent({ type: 'timeupdate' });
			jasmine.clock().tick(1);
			expect(handler).not.toHaveBeenCalled();
		});

		it('must remove all video event listeners', () => {
			cueList.dispose();
			expect(video.removeEventListener).toHaveBeenCalledWith('playing', jasmine.any(Function));
			expect(video.removeEventListener).toHaveBeenCalledWith('timeupdate', jasmine.any(Function));
		});
	});
});
