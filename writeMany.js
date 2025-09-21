//*********************************** Promise version ************************************************************

// const fs = require("node:fs/promises");

//Execution Time: 8s
//CPU Usage: 100% (One Core)
//Memory Usage: 50MB1

// (async()=>{
//     console.time("writeMany")
//     const fileHandle = await fs.open("test.txt" , "w")

//     for(let i = 0; i < 1000000; i++){
//         await fileHandle.write(` ${i} `);
//     }
//     console.timeEnd("writeMany")
// })()


//Execution Time: 1.6s
//CPU Usage: 100% (One Core)
//Memory Usage: 50MB

// const fs = require("node:fs");

// (async()=>{
//     console.time("writeMany");
//     fs.open("test.txt", "w", (err, fd)=>{
//         for(let i = 0; i < 1000000; i++){
//             fs.writeSync(fd, ` ${i} `)
//         }
//     })
//     console.timeEnd("writeMany")

// })()



//Execution Time: 1.8s
//CPU Usage: 100% (One Core)
//Memory Usage: 50MB

const fs = require("node:fs");

(async()=>{
    console.time("writeMany");
    fs.open("test.txt", "w", (err, fd)=>{
        for(let i = 0; i < 1000000; i++){
            const buff = Buffer.from(` ${i} `, "utf-8")
            fs.writeSync(fd, buff)
        }
    })
    console.timeEnd("writeMany")

})()



// const fs = require("node:fs");

// (async()=>{
//     console.time("writeMany");
//     fs.open("test.txt", "w", (err, fd)=>{
//         for(let i = 0; i < 1000000; i++){
//             fs.write(fd, ` ${i} `,()=>{})
//         }
//     })
//     console.timeEnd("writeMany")

// })()