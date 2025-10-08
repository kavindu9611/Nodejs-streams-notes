const { Writable } = require("node:stream");
const fs = require("node:fs");

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writesCount = 0;
  }

  //_construct will run after the construtor runs and before _write,_final,_destroy
  //so run after constructor complete
  //Until  execute the callback inside _construct all the other methods will be paused(_destroy,_write,etc)
  //Some of the things we can do inside construct method is
  //initialize the data
  //Opening file or a resource
  //callback(err) ---> stream exit.and code will not proceed

  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
        //no arguments means it was successful
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    //do our write Operation
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }
        this.chunks = [];
        this.chunksSize = 0;
        ++this.writesCount;

        //when we're done.We should call the callback function
        //callback accept only one parameter error or null
        //if you dont specify anything inside callback indicate that you are done writing and it should move on
        callback();
      });
    } else {
      callback();
    }

    //below thing should not do ever
    //never ever emit events from your child classes
    //this.emit('drain')
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);

      //Never ever do this below
      //throw new Error
      ++this.writesCount;
      this.chunks = [];
      callback();
    });
  }

  //_destroy will run only after run callback() inside _final
  _destroy(error, callback) {
    console.log("Number of writes:", this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

const stream = new FileWriteStream({
  highWaterMark: 1800,
  fileName: "text.txt",
});
stream.write(Buffer.from("This is some string."));

//.end is required to run the _final
stream.end(Buffer.from("Our last write."));

//Below finish event is emit by the callback() inside _final
stream.on("finish", () => {
  console.log("Stream was finished");
});

//callback() inside _write emit this
// stream.on("drain", () => {});

//++i is faster than i++
