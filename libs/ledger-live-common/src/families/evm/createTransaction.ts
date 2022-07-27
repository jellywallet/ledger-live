import BigNumber from "bignumber.js";
import { AccountBridge } from "../../types";
import { Transaction as EvmTransaction } from "./types";

/**
 * EVM Transaction factory.
 * By default the transaction is an EIP-1559 transaction.
 * @see prepareTransaction that will make sure it's compatible or not
 */
export const createTransaction: AccountBridge<EvmTransaction>["createTransaction"] =
  (account) => ({
    family: "evm",
    mode: "send",
    amount: new BigNumber(0),
    recipient: "",
    maxFeePerGas: new BigNumber(0),
    maxPriorityFeePerGas: new BigNumber(0),
    gasLimit: new BigNumber(21000),
    nonce: account.operationsCount + 1,
    chainId: account.currency?.ethereumLikeInfo?.chainId || 0,
    feesStrategy: "medium",
    type: new BigNumber(2),
  });
