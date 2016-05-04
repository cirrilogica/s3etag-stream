// s3etag-stream

/**
  * Module dependencies.
  */

var S3eTagTransformStream = require('./transformstream')
var S3eTagTapStream = require('./tapstream')

/**
  * Creates a transform stream.
  *
  * @param {Object} [options]
  * @return Stream
  */

var createTransformStream = function(options) {
	return new S3eTagTransformStream(this, options);
}

/**
  * Creates a tap stream.
  *
  * @param {Object} options
  * @return Stream
  */

var createTapStream = function(options) {
	return new S3eTagTapStream(this, options);
}

module.exports = {
	createTransformStream: createTransformStream,
	createTapStream: createTapStream
};
