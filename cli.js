import { Reader, TransactionDumper, RPC } from "ckb-js-toolkit";
import { OutPointVec } from "./extensions.esm";
import { version } from "./package.json";
import { Command } from "commander";
import { createReadStream, writeFileSync } from "fs";
import { stdin } from "process";
import { default as nodeFetch } from "node-fetch";
import { ProxyAgent } from "proxy-agent";

function outPointsUnpacker(data) {
  const vec = new OutPointVec(data);
  const results = [];
  for (let i = 0; i < vec.length(); i++) {
    const item = vec.indexAt(i);
    results.push({
      tx_hash: new Reader(item.getTxHash().raw()).serializeJson(),
      index: "0x" + BigInt(item.getIndex().toLittleEndianUint32()).toString(16),
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
    "-x, --tx-hash <tx-hash>",
    "TX hash to load, when both present, this take precedence over --tx",
  )
  .option(
    "-o, --output <output file>",
    "Output file containing dumped tx",
    "dump.json",
  )
  .option("-p, --pretty-print", "Pretty print result file")
  .option("-n, --no-proxy", "Disable proxies");
program.parse();
const options = program.opts();

const run = async () => {
  let fetchImpl = nodeFetch;
  if (options.proxy) {
    const agent = new ProxyAgent();
    fetchImpl = (resource, options) => {
      return nodeFetch(resource, Object.assign({}, options, { agent }));
    };
  }
  const rpc = new RPC(options.rpc, {}, fetchImpl);

  let tx;
  if (options.txHash) {
    tx = (await rpc.get_transaction(options.txHash)).transaction;
    delete tx.hash;
  } else {
    let s = stdin;
    if (options.tx) {
      s = createReadStream(options.tx);
    }
    let result = "";
    for await (const chunk of s) {
      result += chunk;
    }
    tx = JSON.parse(result);
  }

  const dumper = new TransactionDumper(rpc, {
    depGroupUnpacker: outPointsUnpacker,
  });
  let data = await dumper.dump(tx);
  if (options.prettyPrint) {
    data = JSON.stringify(JSON.parse(data), null, 2);
  }
  writeFileSync(options.output, data);
};

run();
