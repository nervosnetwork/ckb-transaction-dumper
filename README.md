# ckb-transaction-dumper

Dump full transaction data for [ckb-standalone-debugger](https://github.com/xxuejie/ckb-standalone-debugger) to use.

# Usage

```
$ npm i --no-save ckb-transaction-dumper
$ npx ckb-transaction-dumper --help
Usage: ckb-transaction-dumper [options]

Options:
  -V, --version               output the version number
  -r, --rpc <rpc>             CKB RPC URL (default: "http://127.0.0.1:8114")
  -t, --tx <tx>               TX file to read, use STDIN if omitted
  -x, --tx-hash <tx-hash>     TX hash to load, when both present, this take precedence over --tx
  -o, --output <output file>  Output file containing dumped tx (default: "dump.json")
  -h, --help                  display help for command
```

Or you can download [precompiled release binaries](https://github.com/xxuejie/ckb-transaction-dumper/releases) if you don't feel like installing node.
