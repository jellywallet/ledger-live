import type { AccountBridge, CurrencyBridge } from "../../../types";
import { makeAccountBridgeReceive } from "../../../bridge/jsHelpers";
import { getTransactionStatus } from "../getTransactionStatus";
import type { Transaction as EvmTransaction } from "../types";
import { prepareTransaction } from "../prepareTransaction";
import { createTransaction } from "../createTransaction";
import { sync, scanAccounts } from "../synchronization";
import { signOperation } from "../signOperation";
import { broadcast } from "../broadcast";

const receive = makeAccountBridgeReceive();

const updateTransaction: AccountBridge<EvmTransaction>["updateTransaction"] = (
  transaction,
  patch
) => {
  return { ...transaction, ...patch } as EvmTransaction;
};

const preload = async (): Promise<Record<any, any>> => Promise.resolve({});

const hydrate = (): void => {};

const currencyBridge: CurrencyBridge = {
  preload,
  hydrate,
  scanAccounts,
};

const accountBridge: AccountBridge<EvmTransaction> = {
  createTransaction,
  updateTransaction,
  prepareTransaction,
  getTransactionStatus,
  sync,
  receive,
  signOperation,
  broadcast,
  estimateMaxSpendable: async () => ({} as any),
};

export default {
  currencyBridge,
  accountBridge,
};
