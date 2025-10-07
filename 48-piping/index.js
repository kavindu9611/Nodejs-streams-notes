//FIle Size Copied: 1GB
//Memory Usage: 30 MB
//Execution Time: 1S

const fs = require("node:fs/promises");

(async () => {
  console.time("copy");
  
  const srcFile = await fs.open("bigFile.txt", "r");
  const destFile = await fs.open("copy.txt", "w");

  const readStream = srcFile.createReadStream()
  const writeStream = destFile.createWriteStream()

  readStream.pipe(writeStream)

  readStream.on("end",()=>{
    console.timeEnd("copy");
  })

  
})();

// Once reading and writing are done, it’s important to properly close the streams.
// If the code above executes successfully, Node.js will automatically close the streams.
// However, if an error occurs during reading or writing, the streams may remain open,
// leading to resource leaks.
// To handle errors and ensure both streams are closed safely, use 'stream.pipeline()' 
// or the 'pump' package instead of manually piping.



// the "end" event runs on the readStream, not the writeStream.

// Here’s what happens step by step:
// srcFile.createReadStream() creates a readable stream (readStream).
// destFile.createWriteStream() creates a writable stream (writeStream).
// When you do readStream.pipe(writeStream), Node.js automatically:
// Reads chunks from readStream
// Writes them to writeStream
// Handles backpressure internally

// When the readStream finishes reading all data from the file, it emits the "end" event.
// That’s when your callback in readStream.on("end", ...) runs — signaling that reading is finished.

// 💡 However:

// "end" only means the readable stream has no more data.
// It doesn’t guarantee that writing to the destination file is completely finished yet.
// If you want to be 100% sure the copy operation is fully done, it’s better to listen to the "finish" event on the writeStream:

// writeStream.on("finish", () => {
//   console.timeEnd("copy");
// });


// That ensures all data has been flushed and written to disk.
// So in short:
// "end" → emitted by readStream (reading done)
// "finish" → emitted by writeStream (writing done ✅)
