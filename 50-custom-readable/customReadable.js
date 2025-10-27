const {Readable} = require("node:stream")

const fs = require("node:fs");

class FileReadStream extends Readable {
    constructor({highWaterMark,fileName}){
        super({highWaterMark});
        this.fileName = fileName;
        this.fd = null

    }

    _construct(callback){
        fs.open(this.fileName, "r", (err, fd)=>{
            if(err) return callback(err)
            this.fd = fd
            callback()    
        })

    }

    _read(size){

        const buff = Buffer.alloc(size)
        fs.read(this.fd,buff,0,size,null,(err,bytesRead)=>{
            if(err) return this.destroy(err)
            this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null)    
        })

        //push to the internal buffer of stream
        //trigger 'data' event
       // this.push(Buffer.from("string"))

       // .push(null) --->This will indicate end of the stream
    }

    _destroy(error,callback){
        if(this.fd){
            fs.close(this.fd, (err)=> callback(err || error))
        }else {
            callback(error)
        }
    }
}

const stream = new FileReadStream({fileName: "text.txt"})

stream.on("data",(chunk)=>{
    console.log(chunk)
})

stream.on("end",()=>{
    console.log("stream is done reading")
})


//lifecycle
// _start_
//    ↓
// _call _read()_
//    ↓
// _push(Buffer.from("string"))_
//    ↓
// _emit 'data'_
//    ↓
// _push(null)_
//    ↓
// _emit 'end'_
//    ↓
// _stop_
