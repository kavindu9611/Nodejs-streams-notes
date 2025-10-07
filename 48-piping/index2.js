const { pipeline } = requre("node:stream");
const fs = require("node:fs/promises");

(async () => {
  console.time("copy");

  const srcFile = await fs.open("bigFile.txt", "r");
  const destFile = await fs.open("copy.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (err) => {
    console.log(err);
    console.timeEnd("copy");
  });
})();

// pipeline(readStream, s1, s2, s3, writeStream)
// s1, s2, s3 must be either Duplex or Transform streams.
// You cannot place a purely Writable stream in the middle.
// For example, if s3 were a Writable stream, pipeline would fail
// because it would try to read from s3 (which isn’t readable) 
// and write to it at the same time.

// Explanation:
// ✅ pipeline connects streams in sequence — it expects:

// First: a Readable stream

// Middle: one or more Duplex/Transform streams (they can read and write)

// Last: a Writable stream

// ❌ If you put a purely writable stream (like fs.createWriteStream()) in the middle, it breaks, because pipeline expects to pipe data through each stage.


//let’s break that part down step by step with a clear example.

// 🧩 Think of pipeline() as a chain of pipes
// Example:


// pipeline(readStream, s1, s2, s3, writeStream)
// Here’s how Node.js connects them internally:


// readStream → s1 → s2 → s3 → writeStream
// This means:

// Data flows forward from left to right.

// Each stream’s output is piped into the next stream’s input.

// 🔍 What happens in the middle
// Now, suppose:

// s1, s2 are Transform streams (they can read and write),

// but s3 is just a Writable stream (like fs.createWriteStream()).

// So the chain looks like:


// readStream → s1 → s2 → s3 → writeStream
// When pipeline() builds this chain:

// It tries to pipe the output of s2 into s3 — ✅ works fine.

// Then it tries to pipe the output of s3 into writeStream — ❌ fails.

// Because s3 is Writable-only — it can receive data, but it cannot pass data forward (it’s not readable).
// So when Node tries to “read” from s3 to feed writeStream, it breaks.

// 🧠 In simpler words
// Think of it like a water pipeline:


// Tank → Filter1 → Filter2 → Filter3 → Bucket
// Each filter can let water flow through (read + write).
// But if Filter3 is just a container (can only receive water, not pass it on),
// the water stops there — it can’t reach the final bucket.

// ✅ So summary
// When we say “it will try to read from s2 and write to s3”, it means:

// Data flows from s2 into s3.

// If s3 isn’t readable (only writable), the pipeline cannot continue to the next stream.

