
import EventEmitter from '../node_modules/events';

/**
 * Creates a simple mock implementation of HTMLVideoElement that uses spies for methods.
 *
 * @returns {Object}
 */
function createVideoMock() {

	let emitter = new EventEmitter();

	return {

		addEventListener: jasmine.createSpy('addEventListener').and.callFake(
			(type, listener) => {
				emitter.addListener(type, listener);
			}
		),

		removeEventListener: jasmine.createSpy('removeEventListener').and.callFake(
			(type, listener) => {
				emitter.removeListener(type, listener);
			}
		),

		dispatchEvent: jasmine.createSpy('dispatchEvent').and.callFake(
			(event) => {
				emitter.emit(event.type);
			}
		)
	};
}

export default { create: createVideoMock };
