const fs = require("node:fs/promises");

(async () => {
  console.time("writeMany");
  const fileHandle = await fs.open("bigFile.txt", "w");

  const stream = fileHandle.createWriteStream();

  let i = 0;

  const numberOfWrites = 1000000

  const writeMany = () => {
    while (i < numberOfWrites) {
      const buff = Buffer.from(` ${i} `, "utf-8");

      if (i === numberOfWrites - 1) {
        stream.end(buff);
        return;
      }

      i++;

      if (!stream.write(buff)) break;

    }
  };

  writeMany();

  stream.on("drain", () => {
    console.log("Drained!!!"); 
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
    fileHandle.close();
  });
})();
