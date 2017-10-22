# video-cues

[![travis](https://img.shields.io/travis/jsalis/video-cues.svg)](https://travis-ci.org/jsalis/video-cues)
[![codecov](https://img.shields.io/codecov/c/github/jsalis/video-cues.svg)](https://codecov.io/gh/jsalis/video-cues)
[![version](https://img.shields.io/npm/v/video-cues.svg)](http://npm.im/video-cues)
[![license](https://img.shields.io/npm/l/video-cues.svg)](http://opensource.org/licenses/MIT)

> A cue utility for HTML5 video

## Installation

```
npm install --save video-cues
```

## Usage

### CueList

```javascript
import { CueList } from 'video-cues';

let video = document.getElementById('video');
let cueList = CueList.create(video);

cueList.add(['25%', '50%', '75%'], (cue) => {
    // cue.offset
    // track progress or start midroll ad
});
```

#### `CueList.create(video)`

Creates a new cue list.

Param `video` **HTMLVideoElement** The video element to trigger cue points. <br />
Returns **Object**

#### `.add(offsets, handler)`

Adds cue points to the list.

Param `offsets` **Array** Values representing the progress required to trigger a cue point. Either a number of seconds, or a percentage as a string. <br />
Param `handler` **Function** The function to call when a cue point is triggered.

#### `.remove(offsets)`

Removes cue points with the given offsets. All cue points are removed if no argument is passed.

Param `offsets` **Array** A list of offsets as a number of seconds, or a percentage as a string.

#### `.offsets()`

Gets the offsets of all cue points.

Returns **Array**

#### `.disable()`

Disables all cue points.

#### `.enable()`

Enables all cue points.

#### `.reset()`

Resets the triggered state of all cue points.

#### `.dispose()`

Clears the the cue list and removes all event listeners.

## License

MIT