const fs = require("node:fs/promises");

// (async()=>{
//     const fileHandleRead = await fs.open("test.txt", "r")

//     const stream = fileHandleRead.createReadStream({highWaterMark: 64 * 1024})

//     stream.on("data", (chunk)=>{
//         console.log("------------")
//         console.log(chunk)
//         console.log(chunk.length)//Highwatermak value 65kb
//     })
// })()

//Reading from src.txt and writing to the dest.txt
//Below is something you should not do
//Typically hard drives has a higher read speed comparing to the write speed
//so here we are having some backpressuring
//we are getting huge amount of data but not getting chance to write them
//So nodejs keep buffering
//our memory usage will be high

// (async () => {
//   //   const fileHandleRead = await fs.open("src.txt", "r");
//   const fileHandleRead = await fs.open("bigFile.txt", "r");
//   const fileHandleWrite = await fs.open("destBig.txt", "w");

//   const streamRead = fileHandleRead.createReadStream({
//     highWaterMark: 64 * 1024,
//   });
//   const streamWrite = fileHandleWrite.createWriteStream();

//   streamRead.on("data", (chunk) => {
//     streamWrite.write(chunk);
//   });
// })();

//Optimized code

(async () => {
  const fileHandleRead = await fs.open("bigFile.txt", "r");
  const fileHandleWrite = await fs.open("destBig.txt", "w");

  const streamRead = fileHandleRead.createReadStream({
    highWaterMark: 64 * 1024,
  });
  const streamWrite = fileHandleWrite.createWriteStream();

  streamRead.on("data", (chunk) => {
    if(!streamWrite.write(chunk)){
      streamRead.pause()
    }
  });
  
  streamWrite.on("drain", ()=>[
    streamRead.resume()
  ])

})();