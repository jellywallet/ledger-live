import type {
  EvmTransactionEIP1559,
  EvmTransactionLegacy,
  Transaction as EvmTransaction,
  TransactionRaw as EvmTransactionRaw,
} from "./types";
import { BigNumber } from "bignumber.js";
import {
  fromTransactionCommonRaw,
  toTransactionCommonRaw,
} from "../../transaction/common";
import type { Account } from "../../types";
import { getAccountUnit } from "../../account";
import { formatCurrencyUnit } from "../../currencies";
import { ethers } from "ethers";
import { getTransactionCount } from "../../api/Evm";

/**
 * Format the transaction for the CLI
 */
export const formatTransaction = (
  { mode, amount, recipient, useAllAmount }: EvmTransaction,
  account: Account
): string =>
  `
${mode.toUpperCase()} ${
    useAllAmount
      ? "MAX"
      : amount.isZero()
      ? ""
      : " " +
        formatCurrencyUnit(getAccountUnit(account), amount, {
          showCode: true,
          disableRounding: true,
        })
  }${recipient ? `\nTO ${recipient}` : ""}`;

/**
 * Serializer raw to transaction
 */
export const fromTransactionRaw = (
  rawTx: EvmTransactionRaw
): EvmTransaction => {
  const common = fromTransactionCommonRaw(rawTx);
  const tx: Partial<EvmTransaction> = {
    ...common,
    family: rawTx.family,
    mode: rawTx.mode,
    chainId: rawTx.chainId,
    nonce: rawTx.nonce,
    gasLimit: new BigNumber(rawTx.gasLimit),
    feesStrategy: rawTx.feesStrategy,
  };

  if (rawTx.data) {
    tx.data = Buffer.from(rawTx.data);
  }

  if (rawTx.type) {
    tx.type = new BigNumber(rawTx.type);
  }

  if (rawTx.gasPrice) {
    tx.gasPrice = new BigNumber(rawTx.gasPrice);
  }

  if (rawTx.maxFeePerGas) {
    tx.maxFeePerGas = new BigNumber(rawTx.maxFeePerGas);
  }

  if (rawTx.maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = new BigNumber(rawTx.maxPriorityFeePerGas);
  }

  return tx as EvmTransaction;
};

/**
 * Serializer transaction to raw
 */
export const toTransactionRaw = (tx: EvmTransaction): EvmTransactionRaw => {
  const common = toTransactionCommonRaw(tx);
  const txRaw: Partial<EvmTransactionRaw> = {
    ...common,
    family: tx.family,
    mode: tx.mode,
    chainId: tx.chainId,
    nonce: tx.nonce,
    gasLimit: tx.gasLimit.toFixed(),
    feesStrategy: tx.feesStrategy,
  };

  if (tx.type) {
    txRaw.type = tx.type.toFixed();
  }

  if (tx.data) {
    txRaw.data = Buffer.from(tx.data).toString("hex");
  }

  if (tx.gasPrice) {
    txRaw.gasPrice = tx.gasPrice?.toFixed();
  }

  if (tx.maxFeePerGas) {
    txRaw.maxFeePerGas = tx.maxFeePerGas?.toFixed();
  }

  if (tx.maxPriorityFeePerGas) {
    txRaw.maxPriorityFeePerGas = tx.maxPriorityFeePerGas?.toFixed();
  }

  return txRaw as EvmTransactionRaw;
};

/**
 * Adapter to convert a Ledger Live transaction to an Ethers transaction
 */
export const transactionToEthersTransaction = (
  tx: EvmTransaction
): ethers.Transaction => {
  const ethersTx = {
    to: tx.recipient,
    value: tx.amount
      ? ethers.BigNumber.from(tx.amount.toFixed())
      : ethers.BigNumber.from(0),
    data: tx.data ? `0x${tx.data.toString("hex")}` : undefined,
    gasLimit: ethers.BigNumber.from(tx.gasLimit.toFixed()),
    nonce: tx.nonce,
    chainId: tx.chainId,
    type: tx.type?.toNumber() ?? 0,
  } as Partial<ethers.Transaction>;

  // is EIP-1559 transaction (type 2)
  if (tx.type?.isEqualTo(new BigNumber(2))) {
    ethersTx.maxFeePerGas = ethers.BigNumber.from(
      (tx as EvmTransactionEIP1559).maxFeePerGas.toFixed()
    );
    ethersTx.maxPriorityFeePerGas = ethers.BigNumber.from(
      (tx as EvmTransactionEIP1559).maxPriorityFeePerGas.toFixed()
    );
  } else {
    // is Legacy transaction (type 0)
    ethersTx.gasPrice = ethers.BigNumber.from(
      (tx as EvmTransactionLegacy).gasPrice.toFixed()
    );
  }

  return ethersTx as ethers.Transaction;
};

/**
 * Create an unsigned transaction from a Ledger Live transaction.
 * Usually called "buildTransaction"
 */
export const transactionToUnsignedTransaction = async (
  account: Account,
  tx: EvmTransaction
): Promise<EvmTransaction> => {
  const { currency, freshAddress } = account;
  const nonce = await getTransactionCount(currency, freshAddress);

  return {
    ...tx,
    nonce,
  };
};

export default {
  formatTransaction,
  fromTransactionRaw,
  toTransactionRaw,
  transactionToEthersTransaction,
  transactionToUnsignedTransaction,
};
