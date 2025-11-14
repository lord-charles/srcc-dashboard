export const statuses = [
  {
    value: "revision_requested",
    label: "Revision Requested",
  },
  {
    value: 'draft',
    label: 'Draft'
  },
  {
    value: 'pending_checker_approval',
    label: 'Pending Checker Approval'
  },
  {
    value: 'pending_manager_approval',
    label: 'Pending Manager Approval'
  },
  {
    value: 'pending_finance_approval',
    label: 'Pending Finance Approval'
  },
  {
    value: 'approved',
    label: 'Approved'
  },
  {
    value: 'rejected',
    label: 'Rejected'
  }
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
