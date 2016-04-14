crypto = require('crypto')

const MD5_BYTES = 16;

module.exports = exports = {
	processOptions: function (options) {

		if (!options) return;

		// Allowed options are
		// - partSize
		// - partCount
		// - totalSize
		// If any of the options are specified, two of them must be specified

		if (options.partSize && options.partCount) {
			this._partSize = options.partSize;
			this._partCount = options.partCount;
		}
		else if (options.partSize && options.totalSize) {
			this._partSize = options.partSize;
			this._partCount = Math.ceil(options.totalSize / options.partSize);
		}
		else if (options.partCount && options.totalSize) {
			this._partCount = options.partCount;
			// Guess at the part size being an integer number of MB
			var mb = Math.ceil((options.totalSize / options.partCount) / (1024 * 1024));
			this._partSize = mb * 1024 * 1024;
		}
	},

	update: function(chunk) {
		if (this._partSize && (this._processedSize + chunk.length >= this._partSize)) {
			// We've come to the end of a part
			// Determine the portion of the chunk to use and create the
			// digest for this part
			useSize = this._partSize - this._processedSize;
			this._hash.update(chunk.slice(0, useSize));
			this._partsProcessed++;
			this._md5sums.push(this._hash.digest());
			// Create new hash for next part and start updating it
			this._hash = crypto.createHash('md5');
			this._hash.update(chunk.slice(useSize));
			this._processedSize = chunk.length - useSize;
		}
		else {
			this._hash.update(chunk)
			this._processedSize += chunk.length
		}
	},

	calculate: function () {
		if (this._processedSize > 0 || this._partsProcessed == 0) {
			this._partsProcessed++;
			this._md5sums.push(this._hash.digest());
		}
		this._processedSize = 0; // Allows this method to be called multiple times
		if (this._md5sums.length == 1) {
			return this._md5sums[0].toString('hex');
		}
		else {
			var combined = Buffer.concat(this._md5sums, this._md5sums.length * MD5_BYTES);
			var hash = crypto.createHash('md5');
			hash.update(combined);
			return hash.digest('hex') + '-' + this._md5sums.length;
		}
	},
};

