
/**
 * Returns whether a string is a percentage.
 *
 * @param   {String} str
 * @returns {Boolean}
 */
const isPercentage = (str) => (/^\d+(\.\d+)?%/g).test(str);

/**
 * Determines if a cue can be triggered.
 *
 * @param   {Object} cue
 * @returns {Boolean}
 */
const canTrigger = (cue) => cue.enabled && !cue.triggered;

/**
 * Parses the time offset of a cue.
 *
 * @param   {Number || String} offset
 * @param   {Number}           duration
 * @returns {Number}
 */
const parseTime = (offset, duration) => {

	if (isPercentage(offset)) {

		return parseFloat(offset) / 100 * duration;

	} else {

		return parseFloat(offset);
	}
};

/**
 * Attempts to trigger a cue point based on the current time of a video element.
 *
 * @type {Function} (video:HTMLVideoElement) => (cue:Object) => void
 */
const tryTrigger = (video) => (cue) => {

	let time = parseTime(cue.offset, video.duration);

	if (video.currentTime >= time) {

		cue.triggered = true;
		setTimeout(() => cue.handler({ offset: cue.offset }), 0);
	}
};

/**
 * Creates a new cue list.
 *
 * @param   {HTMLVideoElement} video
 * @returns {Object}
 */
function createCueList(video) {

	let cueList = [];
	let trigger = () => cueList.filter(canTrigger).forEach(tryTrigger(video));

	video.addEventListener('playing', trigger);
	video.addEventListener('timeupdate', trigger);

	return {

		/**
		 * Adds cue points to the list.
		 *
		 * @param {Array}    offsets    Values representing the progress required to trigger a cue point.
		 *                              Either a number of seconds, or a percentage as a string.
		 * @param {Function} handler    The function to call when a cue point is triggered.
		 */
		add(offsets, handler) {

			offsets = Array.isArray(offsets) ? offsets : [ offsets ];

			offsets.map((offset) => {

				cueList.push({

					offset:    offset,
					handler:   handler,
					triggered: false,
					enabled:   true
				});
			});
		},

		/**
		 * Removes cue points with the given offsets.
		 *
		 * @param {Array} offsets
		 */
		remove(offsets) {

			if (offsets === undefined) {

				cueList = [];

			} else {

				offsets = Array.isArray(offsets) ? offsets : [ offsets ];
				cueList = cueList.filter((cue) => offsets.indexOf(cue.offset) === -1);
			}
		},

		/**
		 * Gets the offsets of all cue points.
		 *
		 * @returns {Array}
		 */
		offsets() {

			return cueList.map((cue) => cue.offset);
		},

		/**
		 * Disables all cue points.
		 */
		disable() {

			cueList.forEach((cue) => {
				cue.enabled = false;
			});
		},

		/**
		 * Enables all cue points.
		 */
		enable() {

			cueList.forEach((cue) => {
				cue.enabled = true;
			});
		},

		/**
		 * Resets all cue points.
		 */
		reset() {

			cueList.forEach((cue) => {
				cue.triggered = false;
			});
		},

		/**
		 * Disposes the cue list.
		 */
		dispose() {

			cueList = [];
			video.removeEventListener('playing', trigger);
			video.removeEventListener('timeupdate', trigger);
		}
	};
}

export default { create: createCueList };
