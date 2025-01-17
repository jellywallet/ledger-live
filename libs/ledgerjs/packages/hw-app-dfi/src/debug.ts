import { MIN_VERSION_NO_TOKENS } from "./splitTransaction";
import type { Transaction } from "./types";
export function formatTransactionDebug(transaction: Transaction): string {

  const versionInt = transaction.version.readInt32LE(0);
  let str = "TX";
  str += " version " + transaction.version.toString("hex");

  if (transaction.locktime) {
    str += " locktime " + transaction.locktime.toString("hex");
  }

  if (transaction.witness) {
    str += " witness " + transaction.witness.toString("hex");
  }

  if (transaction.timestamp) {
    str += " timestamp " + transaction.timestamp.toString("hex");
  }

  if (transaction.nVersionGroupId) {
    str += " nVersionGroupId " + transaction.nVersionGroupId.toString("hex");
  }

  if (transaction.nExpiryHeight) {
    str += " nExpiryHeight " + transaction.nExpiryHeight.toString("hex");
  }

  if (transaction.extraData) {
    str += " extraData " + transaction.extraData.toString("hex");
  }

  transaction.inputs.forEach(({ prevout, script, sequence }, i) => {
    str += `\ninput ${i}:`;
    str += ` prevout ${prevout.toString("hex")}`;
    str += ` script ${script.toString("hex")}`;
    str += ` sequence ${sequence.toString("hex")}`;
  });
  (transaction.outputs || []).forEach(({ amount, script, tokenId }, i) => {
    str += `\noutput ${i}:`;
    str += ` amount ${amount.toString("hex")}`;
    str += ` script ${script.toString("hex")}`;

    str += versionInt > MIN_VERSION_NO_TOKENS ? ` tokenId ${tokenId}` : "";
  });
  return str;
}
export function displayTransactionDebug(transaction: Transaction): void {
  console.log(formatTransactionDebug(transaction));
}
