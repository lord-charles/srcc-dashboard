import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { WalletTransaction } from "@/types/wallet";
import { transactionTypes, statuses } from "../data/data";

const customIncludesStringFilter = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const cellValue = row.getValue(columnId);
  return cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

export const columns: ColumnDef<WalletTransaction>[] = [
  {
    accessorKey: "walletId",
    header: "User",
    accessorFn: (row) =>
      `${row.walletId?.firstName || ""} ${row.walletId?.lastName || ""}`,
    cell: ({ row }) => {
      const firstName = row.original.walletId?.firstName || "N/A";
      const lastName = row.original.walletId?.lastName || "";
      const email = row.original.walletId?.email || "";

      return (
        <div>
          <div className="font-medium">
            {firstName} {lastName}
          </div>
          <div className="text-muted-foreground text-xs">{email}</div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const fullName = `${row.original.walletId?.firstName || ""} ${
        row.original.walletId?.lastName || ""
      }`.toLowerCase();
      const email = row.original.walletId?.email?.toLowerCase() || "";
      return (
        fullName.includes(value.toLowerCase()) ||
        email.includes(value.toLowerCase())
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) =>
      `${row.walletId?.firstName || ""} ${row.walletId?.lastName || ""} `,
    filterFn: customIncludesStringFilter,
    enableHiding: true, // Allow this column to be hidden
    enableSorting: false, // Prevent sorting if not needed
    size: 0, // Set minimal size
    cell: () => null, // This ensures nothing renders in the cell
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("transactionId")}</div>
    ),
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("transactionType") as string;
      const typeOption = transactionTypes.find((t) => t.value === type);

      return (
        <Badge variant="outline" className="capitalize">
          {typeOption?.label || type.replace(/_/g, " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "recipientDetails",
    header: "Recipient",
    cell: ({ row }) => {
      const recipientDetails = row.getValue("recipientDetails") as {
        recipientMpesaNumber?: string;
      };
      return (
        <div className="text-muted-foreground">
          {recipientDetails?.recipientMpesaNumber || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusOption = statuses.find((s) => s.value === status);
      const statusVariant =
        {
          pending: "warning",
          completed: "success",
          failed: "destructive",
        }[status] || "default";

      return (
        <Badge variant={statusVariant as "default"} className="capitalize">
          {statusOption?.label || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("transactionDate"));
      return <div>{format(date, "PPp")}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("description")}</div>
    ),
  },
];
