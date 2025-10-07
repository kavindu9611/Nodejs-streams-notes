const fs = require("node:fs/promises");

(async () => {
  console.time("copy");

  const srcFile = await fs.open("bigFile.txt", "r");
  const destFile = await fs.open("copy.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  console.log(readStream.readableFlowing);

  readStream.pipe(writeStream);
  console.log(readStream.readableFlowing);

  readStream.unpipe(writeStream);
  console.log(readStream.readableFlowing);

  readStream.pipe(writeStream);
  console.log(readStream.readableFlowing);

  readStream.on("end", () => {
    console.timeEnd("copy");
  });
})();

// null - At this point we are not doing anything with the readstream
// true - Start reading
// false -pause reading
// true  - resume reading where it is pause

//In production you should not try to use pipe.because poor error handling
//instead use pipeline

//  in production, you just run this piping and you leave the streams as be and some errors might
// happen, and actually they happen quite often, your files might just get removed for whatever reason.
// Something might happen in your system, and maybe you're just dealing with a network, and your network
// might just go down for a couple of seconds, or just for a couple of milliseconds or a couple of microseconds.
// So errors do happen quite often in production.
// And using piping is not really recommended because in that case, you're leaving a lot of streams open
// and you're going to run into some memory leaks and memory issues.
// So always clean up when you do have an error.
// So you can just use pipeline and automatically let node handle those things for you.