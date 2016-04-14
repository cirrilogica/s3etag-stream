// s3etag-stream

/**
  * Module dependencies.
  */

var S3eTagTransformStream = require('./transformstream')
var S3eTagTapStream = require('./tapstream')

/**
  * Grid constructor
  *
  * @param {mongo.Db} db - an open mongo.Db instance
  * @param {mongo} [mongo] - the native driver you are using
  */

function S3eTag() {
	if (!(this instanceof S3eTag)) {
		return new S3eTag();
	}
}

/**
  * Creates a transform stream.
  *
  * @param {Object} [options]
  * @return Stream
  */

S3eTag.prototype.createTransformStream = function(options) {
	return new S3eTagTransformStream(this, options);
}

/**
  * Creates a tap stream.
  *
  * @param {Object} options
  * @return Stream
  */

S3eTag.prototype.createTapStream = function(options) {
	return new S3eTagTapStream(this, options);
}

/**
  * expose
  */

module.exports = exports = S3eTag;
