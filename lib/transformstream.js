/**
  * Module dependencies
  */

var util = require('util');
var Transform  = require('stream').Transform;
var common = require('./common');

/**
  * expose
  * @ignore
  */

module.exports = exports = S3eTagTransformStream;

/**
  * S3eTagTransformStream
  *
  * @param {Object} options (optional)
  */

function S3eTagTransformStream (s3eTag, options) {
	if (!(this instanceof S3eTagTransformStream))
		return new S3eTagTransformStream(s3eTag, options);
	Transform.call(this);

	// Initialize all state variables
    this._md5sums = []; // Array of md5sums
	this._partsProcessed = 0; // Number of parts processed
    this._processedSize = 0; // Size of data processed in the current part
    this._partCount = 1; // > 1 when upload was multi-part
    this._partSize = 0; // Size of each part
	this._processing = false; // Are we processing data yet?

	this._hash = crypto.createHash('md5');

	common.processOptions.call(this, options);
}

/**
  * Inherit from stream.Transform
  * @ignore
  */

util.inherits(S3eTagTransformStream, Transform);

// private api

/**
  * _transform
  *
  * @api private
  */

S3eTagTransformStream.prototype._transform = function (chunk, encoding, cb) {
	this._processing = true;
	common.update.call(this, chunk);
	cb();
};

/**
  * _flush
  *
  * @api private
  */

S3eTagTransformStream.prototype._flush = function (cb) {
	this.push(common.calculate.call(this));
	cb();
};

// public api

/**
  * setOptions
  *
  * @api public
  */

S3eTagTransformStream.prototype.setOptions = function (options) {
	if (this._processing) {
		throw new Error('Setting options prohibited. Already processing data.');
	}
	return common.processOptions.call(this, options);
};
