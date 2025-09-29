const fs = require("node:fs/promises");

// (async()=>{
//     console.log("writeMany")

//     const fileHandle = await fs.open("test.txt", "w")

//     const stream = fileHandle.createWriteStream()

//     console.log(stream.writableHighWaterMark)//16384
//     console.log(stream.writableLength)//0              -How much buffer filled

//     const buff = Buffer.from("string")

//     stream.write(buff)

//     console.log(buff)//<Buffer 73 74 72 69 6e 67>

//     console.log(stream.writableLength)//6

//      console.log("writeMany")

// })()

// (async()=>{

//     const fileHandle = await fs.open("test.txt", "w")

//     const stream = fileHandle.createWriteStream()

//     console.log(stream.writableHighWaterMark)//16384

//8 bits = 1 byte
//100 bytes = 1 kilobyte
//1000 kilobytes = 1 megabyte

//     const buff = Buffer.alloc(16383,"a")
//     console.log(stream.write(buff))//true
//     console.log(stream.write(Buffer.alloc(1,"a")))//false
//     console.log(stream.write(Buffer.alloc(1,"a")))//false
//     console.log(stream.write(Buffer.alloc(1,"a")))//false

//     console.log(stream.writableLength)//16386

//     stream.on("drain", ()=>{

//         console.log(stream.write(Buffer.alloc(1,"a")))//true
//         console.log(stream.writableLength)//1

//         console.log("We are now safe to write more!")
//     })

// setInterval(()=>{},1000)

// fileHandle.close()

// })()

//writableLength value must not exceed writableHighWaterMark
//Do not let happen that
//it will cause memory issues.
//writableLength value exceeding means we are writing to the buffer(external to the stream internal buffer)
//wait for the drain event

//Fixing the memory issue

(async () => {
  console.time("writeMany");
  const fileHandle = await fs.open("test.txt", "w");

  const stream = fileHandle.createWriteStream();

  let i = 0;

  const writeMany = () => {
    while (i < 1000000) {
      const buff = Buffer.from(` ${i} `, "utf-8");

      //This is our last write
      if (i === 999999) {
        stream.end(buff);
        return;
      }

      i++;
      //If stream.write returns false,stop the loop
      if (!stream.write(buff)) break;

      //above is good but this is the good practice
     // const canContinue = stream.write(buff);
     // i++; // increment only after a guaranteed write
     // if (!canContinue) break;

    }
  };

  writeMany();

  //Resume the loop once the stream internal buffer is empty
  stream.on("drain", () => {
    console.log("Drained!!!"); //this logged 481 times ----> size of the test.txt (7.9 MB (7,888,890 bytes)) / 16384
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
    fileHandle.close();
  });
})();
