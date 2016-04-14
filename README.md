# Amazon AWS S3 eTag Stream

Simple stream implementation of an eTag calculator for objects in
Amazon AWS S3.

## Introduction

The Amazon AWS S3 eTag stream module calculates the eTag that Amazon
AWS attaches as meta-data to files uploaded to S3. For files uploaded as
a single part, the eTag is just the MD5 hash of the file's contents.
For files uploaded in multiple parts (which is the default for the
AWS CLI when files are over a certain size) or files which are encrypted
by AWS, the eTag is calculated differently.

Here is the
[official word from AWS](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html)
on the eTag for objects in S3.

This [Stackoverflow post](http://stackoverflow.com/questions/12186993/what-is-the-algorithm-to-compute-the-amazon-s3-etag-for-a-file-larger-than-5gb)
give a good description of the algorithm used to calculate the eTag for 
multi-part uploaded objects, as well as links to implementations in other
languages.

In short the eTag for a multi-part uploaded
object will be the MD5 hash of the MD5 hashes of the parts followed by a
dash and the number of parts hashed. For example, the eTag
```
17d532e96a0aca87d3f3f6283262e2e2-4
```
indicates that the eTag was created from the hashes of 4 parts.

## Limitations

This module does not detect files encrypted by AWS and does not calculate
their eTags.

## Usage

This module provides two mechanisms to calculate the eTag for an
AWS S3 object:

* The tap stream acts as a pass-through stream sending the same data out
that was received. On a read 'end' event or a write 'finish' event,
the eTag can be read by making a call to the calculate() method on the
tap stream.
* The transform stream writes the eTag to the output of the stream.

Both streams inherit from the NodeJS Transform stream.

In either case, the streams are created as shown below:
```js
var s3eTag = require('s3etag-stream')();
```

Both streams take an options hash that can be passed either when the
stream is created or using the setOptions() method. Note that the
setOptions() method cannot be called after the stream starts processing
data. The allowed options are
* partSize - the size of the parts in a multi-part upload
* partCount - the number of parts in a multi-part upload
* totalSize - the total size of the object

If no options are specified, the eTag is calculated assuming a single-part
upload. If any options are specified, any two of them must be specified --
the other can be calculated from them.

Hint: When using this module to verify a file to be downloaded, make
a HEAD request on the object first. This will give you the object size in
the 'content-length' header and the number of parts in the eTag.

### Tap Streams

The basic form for calculating the eTag using a tap stream is

```js
var s3eTag = require('s3etag-stream')();

var tap = s3eTag.createTapStream();
tap.write('This is a test');
tap.end(function() {
	console.log('eTag:', tap.calculate());
});
```

An example of using the tap stream to calculate the eTag of a multi-part
uploaded file using a copy of the file stored on the local filesystem
would be

```js
var s3eTag = require('s3etag-stream')();
var fs = require('fs');

var input = fs.createReadStream('/path/to/file.ext');
var options = { partSize: 8 * 1024 * 1024, partCount: 4 };
var tap = s3eTag.createTapStream(options);
tap.on('finish', function() {
	console.log('eTag:', tap.calculate());
});
input.pipe(tap);
```

Alternatively, you could pass the options in a separate call
to setOptions():

```js
...
var options = { partSize: 8 * 1024 * 1024, partCount: 4 };
var tap = s3eTag.createTapStream();
tap.setOptions(options);
...
```

### Transform Streams

The basic form for calculating the eTag using a transform stream is

```js
var s3eTag = require('s3etag-stream')();

var transform = s3eTag.createTransformStream();
transform.pipe(process.stdout);
transform.write('This is a test');
transform.end();
```

An example of using the transform stream to calculate the eTag of a
multi-part uploaded file using a copy of the file stored on the local
filesystem would be

```js
var s3eTag = require('s3etag-stream')();
var fs = require('fs');

var input = fs.createReadStream('/path/to/file.ext');
var options = { partSize: 8 * 1024 * 1024, partCount: 4 };
var transform = s3eTag.createTransformStream(options);
input.pipe(transform).pipe(process.stdout);
```

## License

This module is licensed under the MIT License. See the file LICENSE
for a complete copy of the license.
