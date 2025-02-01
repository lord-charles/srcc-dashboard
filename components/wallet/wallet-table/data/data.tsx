export const statuses = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "failed",
    label: "Failed",
  },
];

export const transactionTypes = [
  {
    value: "withdrawal",
    label: "Withdrawal",
  },
  {
    value: "deposit",
    label: "Deposit",
  },
  {
    value: "send_to_mpesa",
    label: "Send to M-Pesa",
  },
];

export const transactionTypesAll = [
  {
    value: "withdrawal",
    label: "Withdrawal",
  },
  // {
  //   value: "send_to_mpesa",
  //   label: "Wallet to M-Pesa",
  // },
  {
    value: "receive_from_mpesa",
    label: "M-Pesa to Wallet",
  },
  {
    value: "transfer_to_wallet",
    label: "Wallet to Wallet",
  },
  {
    value: "receive_from_advance",
    label: "Receive from Advance",
  },
];
