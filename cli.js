import { Reader, TransactionDumper, RPC } from "ckb-js-toolkit";
import { OutPointVec } from "./extensions.esm";
import { version } from "./package.json";
import { Command } from "commander";
import { createReadStream, writeFileSync } from "fs";
import { argv, stdin } from "process";

function outPointsUnpacker(data) {
  const vec = new OutPointVec(data);
  const results = [];
  for (let i = 0; i < vec.length(); i++) {
    const item = vec.indexAt(i);
    results.push({
      tx_hash: new Reader(item.getTxHash().raw()).serializeJson(),
      index: "0x" + BigInt(item.getIndex().toLittleEndianUint32()).toString(16)
    });
  }
  return results;
}

const program = new Command();
program
  .version(version)
  .option("-r, --rpc <rpc>", "CKB RPC URL", "http://127.0.0.1:8114")
  .option("-t, --tx <tx>", "TX file to read, use STDIN if omitted")
  .option(
    "-h, --tx-hash <tx-hash>",
    "TX hash to load, when both present, this take precedence over --tx"
  )
  .option(
    "-o, --output <output file>",
    "Output file containing dumped tx",
    "dump.json"
  );
program.parse(argv);

const run = async () => {
  const rpc = new RPC(program.rpc);

  let tx;
  if (program.txHash) {
    tx = (await rpc.get_transaction(program.txHash)).transaction;
    delete tx.hash;
  } else {
    let s = stdin;
    if (program.tx) {
      s = createReadStream(program.tx);
    }
    let result = "";
    for await (const chunk of s) {
      result += chunk;
    }
    tx = JSON.parse(result);
  }

  const dumper = new TransactionDumper(rpc, {
    depGroupUnpacker: outPointsUnpacker
  });
  const data = await dumper.dump(tx);
  writeFileSync(program.output, data);
};

run();
