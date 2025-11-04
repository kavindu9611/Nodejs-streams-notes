const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

//Transport inherit from duplex.so you dont have to write _write,_read,_destroy
//they are inheriting from duplex

class Encrypt extends Transform {
  // _transform(chunk, encoding, callback) {
  //   console.log(chunk.toString("utf-8"));  //output ----> This is something to read
  //   this.push(chunk);
  // }

  _transform(chunk, encoding, callback) {
    // <34 + 1, ff, a4 + 1, 11 + 1, 22 + 1,.....>
    for (let i = 0; i < chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }
    // this.push(chunk);
    callback(null, chunk)
  }
}

//chunk is look like this
// <34, ff, a4, 11, 22,.....>
// 52 !== '52' ----> These are not equal whatsoever
//decimal 52 is totally different from string 52

//One way we can encrypt our data is by modifying
//these values
// <34, ff, a4, 11, 22,.....>
//something that we can do is by add
//one to each one of them like this
// <34 + 1, ff + 1, a4 + 1, 11 + 1, 22 + 1,.....>

(async () => {
  const readFileHandle = await fs.open("read.txt", "r");
  const writeFileHandle = await fs.open("write.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const encrypt = new Encrypt();

  readStream.pipe(encrypt).pipe(writeStream);
})();
