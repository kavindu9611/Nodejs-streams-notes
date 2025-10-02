//Without using streams copy the file
//fs.readFile ---> This function open the file and return the all the contents
// in one buffer

//below method is okay if you are dealing with really small files
//File Size: 1GB
//Memory Usage: 1 GB
//Execution Time: 900ms

// const fs = require("node:fs/promises");

// (async ()=>{
//   const destFile = await fs.open("text-copy.txt","w")
//   const result = await fs.readFile("test.txt")

//   await destFile.write(result)

//   console.log(result)
// })()



//Our own streaming solution
//srcFile.read() ---->This return chunk(16kb)

//File Size: 1GB
//Memory Usage: 30MB
//Execution Time: 2S

const fs = require("node:fs/promises");

(async () => {
  console.time("copy");
  
  const srcFile = await fs.open("test.txt", "r");
  const destFile = await fs.open("text-copy.txt", "w");

  let bytesRead = -1

  while(bytesRead !== 0){
    const readResult = await srcFile.read();
    bytesRead = readResult.bytesRead

    if(bytesRead !== 16384){
        const indexOfNotFilled = readResult.buffer.indexOf(0)
        const newBuffer = Buffer.alloc(indexOfNotFilled)
        readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled)
        destFile.write(newBuffer)

    }else{
        destFile.write(readResult.buffer)
    }
  }

  console.timeEnd("copy");
})();
