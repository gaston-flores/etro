# Vidar

[![](https://img.shields.io/npm/v/vidar)](https://www.npmjs.com/package/vidar)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fclabe45%2Fvidar%2Fbadge&style=flat)](https://actions-badge.atrox.dev/clabe45/vidar/goto)

> [Version 0.8 is out](https://clabe45.github.io/vidar/blog/introducing-v0-8-0)!
> Check out [this guide](https://clabe45.github.io/vidar/docs/migrating-v0-8-0)
> for migrating.

Vidar is a typescript framework for programmatically editing videos. Similar to
GUI-based video-editing software, it lets you composite layers and add effects.
Vidar comes shipped with text, video, audio and image layers, along with a bunch
of GLSL effects. You can also define your own layers and effects with javascript
and GLSL.

## Features

- Composite video and audio layers
- Use built-in hardware accelerated effects
- Write your own effects in JavaScript and GLSL
- Manipulate audio with the web audio API *(audio effects coming soon)*
- Define layer and effect parameters as keyframes or custom functions
- Render to a blob in realtime *(offline rendering coming soon)*

## Installation

```
npm i vidar
```

## Basic Usage

Let's look at an example:
```js
import vd from 'vidar'

var movie = new vd.Movie({ canvas: outputCanvas })
var layer = new vd.layer.Video({ startTime: 0, source: videoElement })  // the layer starts at 0s
movie.addLayer(layer)

movie.record({ frameRate: 24 })  // or just `play` if you don't need to save it
    .then(blob => ...)
```

The blob could then be downloaded as a video file or displayed using a `<video>`
element.

## Effects

Effects can transform the output of a layer or movie:
```js
var layer = new vd.layer.Video({ startTime: 0, source: videoElement })
    .addEffect(new vd.effect.Brightness({ brightness: +100) }))
```

## Dynamic Properties

Most properties also support keyframes and functions:
```js
// Keyframes
layer.effects[0].brightness = new vd.KeyFrame(
  [0, -75],  // brightness == -75 at 0 seconds
  [2, +75]  // +75 at 2 seconds
)

// Function
layer.effects[0].brightness = () => 100 * Math.random() - 50
```

## Using in Node

To use Vidar in Node, see the [wrapper](https://github.com/clabe45/vidar-node):

## Running the Examples

First, download the assets for the examples:

```
npm run assets
```

Then, start the development server (only used for convience while developing;
you don't need a server to use Vidar):

```
npm start
```

Now you can open any example (such as
http://127.0.0.1:8080/examples/introduction/hello-world1.html).

## Further Reading

- [Documentation](https://clabe45.github.io/vidar/docs)

## Contributing

See the [contributing guide](CONTRIBUTING.md)

## License

Distributed under GNU General Public License v3. See `LICENSE` for more
information.
