var fs = require('fs');
var chai = require('chai');
var streamBuffers = require('stream-buffers');
var s3eTag = require('../');

chai.should();

describe('S3eTag', function() {
	describe('Tap Stream', function() {
		it('should calculate the correct eTag for a zero size upload', function(done) {
			var input = new streamBuffers.ReadableStreamBuffer();
			var tap = s3eTag.createTapStream();
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('d41d8cd98f00b204e9800998ecf8427e');
				done();
			});
			input.pipe(tap);
			input.stop();
		});

		it('should calculate the correct eTag assuming a single-part upload', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream();
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('7de58a36f247bc38fbed27d6798abbec');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 5MB parts with parts specified at stream creation', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream({ partSize: 5 * 1024 * 1024, partCount: 3 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('938f344ceede58d8a25f9e15d5667f33-3');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 5MB parts with parts specified after stream creation', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream();
			tap.setOptions({ partSize: 5 * 1024 * 1024, partCount: 3 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('938f344ceede58d8a25f9e15d5667f33-3');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part size and part count', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream({ partSize: 6 * 1024 * 1024, partCount: 2 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part size and total size', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream({ partSize: 6 * 1024 * 1024, totalSize: 12582912 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part count and total size', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream({ partCount: 2, totalSize: 12582912 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(tap);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 8MB parts', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream({ partSize: 8 * 1024 * 1024, partCount: 2 });
			input.on('end', function() {
				var etag = tap.calculate();
				etag.should.equal('c1813111a09d1b78ab9e78a7dbb3ca5a-2');
				done();
			});
			input.pipe(tap);
		});

		it('should disallow updating part information after the stream starts flowing', function(done) {
			this.slow(200);
			var timeoutFn = function(done) {
				try {
					tap.setOptions({ partSize: 8 * 1024 * 1024, partCount: 2 });
					done(new Error('This test should have failed.'));
				}
				catch (ex) {
					ex.should.match(/Setting options prohibited\. Already processing data\./);
					done();
				}
			};
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var tap = s3eTag.createTapStream();
			input.pipe(tap);
			setTimeout(timeoutFn, 100, done);
		});
	});

	describe('Transform Stream', function() {
		it('should calculate the correct eTag for a zero size upload', function(done) {
			var input = new streamBuffers.ReadableStreamBuffer();
			var transform = s3eTag.createTransformStream();
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('d41d8cd98f00b204e9800998ecf8427e');
				done();
			});
			input.pipe(transform).pipe(output);
			input.stop();
		});

		it('should calculate the correct eTag assuming a single-part upload', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream();
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('7de58a36f247bc38fbed27d6798abbec');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 5MB parts with parts specified at stream creation', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream({ partSize: 5 * 1024 * 1024, partCount: 3 });
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('938f344ceede58d8a25f9e15d5667f33-3');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 5MB parts with parts specified after stream creation', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream();
			var output = new streamBuffers.WritableStreamBuffer();
			transform.setOptions({ partSize: 5 * 1024 * 1024, partCount: 3 });
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('938f344ceede58d8a25f9e15d5667f33-3');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part size and part count', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream({ partSize: 6 * 1024 * 1024, partCount: 2 });
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part size and total size', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream({ partSize: 6 * 1024 * 1024, totalSize: 12582912 });
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 6MB parts, specifying the part count and total size', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream({ partCount: 2, totalSize: 12582912 });
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('2bff0d13012c6d4b2bd7f113f6b55829-2');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should calculate the correct eTag assuming a multi-part upload with 8MB parts', function(done) {
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream({ partSize: 8 * 1024 * 1024, partCount: 2 });
			var output = new streamBuffers.WritableStreamBuffer();
			output.on('finish', function() {
				output.getContentsAsString('utf8').should.equal('c1813111a09d1b78ab9e78a7dbb3ca5a-2');
				done();
			});
			input.pipe(transform).pipe(output);
		});

		it('should disallow updating part information after the stream starts flowing', function(done) {
			this.slow(200);
			var timeoutFn = function(done) {
				try {
					transform.setOptions({ partSize: 8 * 1024 * 1024, partCount: 2 });
					done(new Error('This test should have failed.'));
				}
				catch (ex) {
					ex.should.match(/Setting options prohibited\. Already processing data\./);
					done();
				}
			};
			var input = fs.createReadStream('./test/fixtures/random.bin');
			var transform = s3eTag.createTransformStream();
			var output = new streamBuffers.WritableStreamBuffer();
			input.pipe(transform).pipe(output);
			setTimeout(timeoutFn, 100, done);
		});
	});
});
