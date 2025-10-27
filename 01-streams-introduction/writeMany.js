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

// const fs = require("node:fs");

// (async()=>{
//     console.time("writeMany");
//     fs.open("test.txt", "w", (err, fd)=>{
//         for(let i = 0; i < 1000000; i++){
//             const buff = Buffer.from(` ${i} `, "utf-8")
//             fs.writeSync(fd, buff)
//         }
//     })
//     console.timeEnd("writeMany")

// })()



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



//Notes from chatgpt

/*
==============================================
🧩 Node.js File Writing APIs — fs vs fileHandle
==============================================

Node.js provides two main ways to write to files:

1️⃣ fs module functions  →  use file descriptors (fd)
2️⃣ FileHandle methods   →  modern Promise-based API (fs.promises)

-------------------------------------------------
🔹 1. fs.writeSync / fs.write (Legacy, Callback-based)
-------------------------------------------------
- Works with a file descriptor (fd), which is a number.
- Uses the underlying OS write() system call.
- Blocking when using writeSync.

Example:
    const fs = require("node:fs");
    const fd = fs.openSync("test.txt", "w"); // returns number (e.g., 3)
    fs.writeSync(fd, "Hello World!");
    fs.closeSync(fd);

-------------------------------------------------
🔹 2. fileHandle.write (Modern, Promise-based)
-------------------------------------------------
- Part of fs.promises API.
- You first open the file using await fs.open() to get a FileHandle object.
- The FileHandle wraps the file descriptor and exposes async methods.

Example:
    const fs = require("node:fs/promises");

    (async()=>{
        const fileHandle = await fs.open("test.txt", "w");
        await fileHandle.write("Hello World!");
        await fileHandle.close();
    })();

-------------------------------------------------
🧠 How They Work (Conceptual Diagram)
-------------------------------------------------

                    ┌────────────────────────┐
                    │    Your Node.js App     │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                                         │
   ┌────────▼────────┐                      ┌─────────▼──────────┐
   │  fs (callback / │                      │ fs.promises (async)│
   │  sync functions)│                      │  → FileHandle API   │
   └────────┬────────┘                      └─────────┬──────────┘
            │                                         │
            │                                         │
            ▼                                         ▼
     fs.writeSync(fd, data)                fileHandle.write(data)
            │                                         │
            └─────────────── Both internally call ─────┘
                             ↓
                    OS System Call: write(fd, buffer, ...)
                             ↓
                      OS Page Cache / Disk

💡 In both cases, Node.js eventually calls the same low-level
   "write()" system call provided by the operating system.

-------------------------------------------------
⚙️ Comparison Table
-------------------------------------------------
| Feature              | fs.writeSync() / fs.write() | fileHandle.write() |
|----------------------|-----------------------------|--------------------|
| API Type             | Synchronous / Callback      | Promise-based (async/await) |
| Requires             | File Descriptor (fd)        | FileHandle object |
| Blocking?            | Yes (writeSync)             | No |
| Introduced In        | Early Node.js versions      | Node.js v10+ |
| Style                | Low-level / Legacy          | Modern / High-level |

-------------------------------------------------
🧱 Example Difference

Using fs (old-style)

fs.open("test.txt", "w", (err, fd)=>{
    for(let i = 0; i < 1000000; i++){
        fs.writeSync(fd, ` ${i} `);
    }
    fs.closeSync(fd);
});

// Using fs.promises (modern)
const fsPromises = require("node:fs/promises");

(async()=>{
    const fileHandle = await fsPromises.open("test.txt", "w");
    for(let i = 0; i < 1000000; i++){
        await fileHandle.write(` ${i} `);
    }
    await fileHandle.close();
})();

-------------------------------------------------
🧩 Summary / Key Takeaway

- `fs.writeSync(fd, data)`  → directly writes using numeric fd (blocking)
- `fileHandle.write(data)`  → async wrapper using FileHandle object
- Both call the same low-level OS write() syscall under the hood.
- Prefer fs.promises (FileHandle) for modern async code.

=================================================
*/


/*
==============================================
⚙️  How the write() System Call Actually Works
==============================================

When you use a Node.js function like:
    fs.writeSync(fd, "Hello")
or
    await fileHandle.write("Hello")

Under the hood, Node.js eventually calls the OS-level system call:
    write(fd, buffer, length)

This is how the data actually flows:

-------------------------------------------------
🧩 Step-by-Step Process
-------------------------------------------------

1️⃣  Node.js creates a Buffer in user space memory.
     - Your string ("Hello") is converted to binary data.
       Example: "123" → <Buffer 31 32 33>

2️⃣  Node.js calls the "write()" system call.
     - This transfers control from user space → kernel space.
     - The kernel copies your buffer into its own memory area.

3️⃣  The kernel stores the data in the **Page Cache** (in RAM).
     - This is a temporary staging area managed by the OS.
     - The kernel marks these "pages" as dirty (not yet on disk).
     - The write() call returns immediately after this copy.

4️⃣  The kernel flushes the data to disk later, when:
     - The page cache is full,
     - The file is closed,
     - A timeout occurs,
     - Or an app explicitly calls fsync(fd).

5️⃣  If power fails before flushing, data in page cache may be lost.
     - Critical apps (like databases) call fsync() to ensure data persistence.

-------------------------------------------------
💾  Visual Diagram
-------------------------------------------------

User Space (Node.js)                           Kernel Space (Operating System)
───────────────────────────────────────────────────────────────────────────────
 fs.writeSync(fd, "123")

       │
       ▼
 [Node.js creates Buffer]
 <Buffer 31 32 33>

       │
       ▼
 ───────────────────────→ [ write(fd, buffer, len) syscall ] ───────────────────┐
                              │
                              ▼
                        Copy buffer → OS Page Cache (RAM)
                              │
                              ▼
                      Mark page as "dirty" (not on disk)
                              │
                              ▼
                  (Later) OS flushes Page Cache → Disk

-------------------------------------------------
🧠  Summary Table
-------------------------------------------------
| Stage               | Where It Happens  | Description                              |hgbh
|----------------------|------------------|------------------------------------------|
| Buffer Creation      | Node.js user space | Data turned into binary Buffer           |
| write() syscall      | User → Kernel boundary | Kernel receives write request     |
| Page Cache write     | Kernel memory (RAM) | Data copied into OS cache (fast)       |
| Disk write (flush)   | Physical storage   | Happens later by kernel or fsync() call |

-------------------------------------------------
🔹 Key Insights
-------------------------------------------------
- write() does *not* write directly to the disk.
- It only ensures data is safely copied into kernel memory (page cache).
- The OS later writes cached pages to the physical drive.
- For guaranteed persistence, call fsync(fd).

=================================================
*/

/*
──────────────────────────────────────────────────────────────
🧩 How Writing Works in Node.js (fs.writeSync, fileHandle.write)
──────────────────────────────────────────────────────────────

📘 1. High-level Overview
When you write data to a file in Node.js, the data does not go
directly from your JS code to the physical disk. It flows
through several layers:

   JavaScript Code
        ↓
   Node.js fs Module (C++ Binding)
        ↓
   libuv (C Library inside Node)
        ↓
   Operating System Kernel
        ↓
   OS Page Cache (Buffer in RAM)
        ↓
   Disk Controller → Physical Disk

──────────────────────────────────────────────────────────────
💡 Example: fs.writeSync(fd, "Hello")
──────────────────────────────────────────────────────────────

→ Step 1: Node.js calls libuv (C++ binding to C functions).
→ Step 2: libuv calls the OS-level write() system call.
→ Step 3: The OS takes your data and stores it in the
          *page cache* (a memory buffer).
→ Step 4: Later, the kernel’s I/O scheduler flushes the
          cached data to the physical disk.

So when you call `fs.writeSync()`:
- The write() syscall happens immediately (blocking the thread).
- But the data may still live temporarily in page cache memory.
- The OS decides when to actually flush it to disk.

──────────────────────────────────────────────────────────────
⚙️ libuv’s Role
──────────────────────────────────────────────────────────────

- libuv acts as Node.js’s **bridge** between JavaScript
  and the OS’s system calls.
- For asynchronous functions (like fs.write or fileHandle.write),
  libuv delegates the write() system call to its thread pool
  so that JavaScript can keep running.
- For synchronous functions (like fs.writeSync),
  libuv performs the write() system call directly on the main thread,
  blocking until it finishes.

──────────────────────────────────────────────────────────────
📊 Summary

| Function Type | Who Calls write() | Blocking | Uses libuv Thread Pool |
|----------------|------------------|-----------|------------------------|
| fs.writeSync   | libuv → OS       | ✅ Yes    | ❌ No                  |
| fs.write       | libuv → Thread   | ❌ No     | ✅ Yes                 |
| fileHandle.write | libuv → Thread | ❌ No     | ✅ Yes                 |

──────────────────────────────────────────────────────────────
🧠 Remember:
Even though `fs.writeSync()` “writes immediately”, the actual
disk operation might still be delayed by the OS’s page cache.
──────────────────────────────────────────────────────────────
*/




//*********************Stream Example*********************************

//Naively using streams

const fs = require("node:fs/promises");

//DON'T DO IT THIS WAY!!!
// Execution Time: 270ms
// CPU Usage: 100% (One Core)
// Memory Usage: 200MB

(async()=>{
    console.time("writeMany")
    const fileHandle = await fs.open("test.txt" , "w")

    const stream = fileHandle.createWriteStream()

    for(let i = 0; i < 1000000; i++){
       const buff = Buffer.from(` ${i} `, "utf-8")
       stream.write(buff)
    }
    console.timeEnd("writeMany")
})()