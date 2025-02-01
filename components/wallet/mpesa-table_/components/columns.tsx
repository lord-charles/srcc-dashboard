import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PaymentTransaction } from "@/types/wallet";
import { DataTableColumnHeader } from "./data-table-column-header";

const customIncludesStringFilter = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const cellValue = row.getValue(columnId);
  return cellValue.toLowerCase().includes(filterValue.toLowerCase());
};


export const columns: ColumnDef<PaymentTransaction>[] = [
	{
		accessorKey: "mpesaReceiptNumber",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="TransactionId" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("mpesaReceiptNumber")}</div>
		),
	},
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) =>
      `${row.transactionId || ""} ${row.receiverPartyPublicName || ""} ${row.phoneNumber || ""}`,
    filterFn: customIncludesStringFilter,
    enableHiding: true, // Allow this column to be hidden
    enableSorting: false, // Prevent sorting if not needed
    size: 0, // Set minimal size
    cell: () => null, // This ensures nothing renders in the cell
  },
	{
        
		accessorKey: "transactionType",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Type" />
		),
		cell: ({ row }) => {
			const type = row.getValue("transactionType") as string;
			return (
				<Badge variant="outline" className="capitalize">
					{type.replace(/_/g, " ")}
				</Badge>
			);
		},
	},
	{
		accessorKey: "amount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Amount" />
		),
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
		accessorKey: "phoneNumber",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phone Number" />
		),
		cell: ({ row }) => (
			<div className="text-muted-foreground">{row.getValue("phoneNumber")}</div>
		),
	},
	{
		accessorKey: "receiverPartyPublicName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Customer Name" />
		),
		cell: ({ row }) => (
			<div className="text-muted-foreground">
				{row.getValue("receiverPartyPublicName")}
			</div>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			const statusVariant =
				{
					pending: "warning",
					completed: "success",
					failed: "destructive",
				}[status] || "default";

			return (
				<Badge variant={statusVariant as "default"} className="capitalize">
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Date" />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return <div>{format(date, "PPp")}</div>;
		},
	},
	{
		accessorKey: "resultDesc",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Description" />
		),
		cell: ({ row }) => (
			<div className="text-muted-foreground">{row.getValue("resultDesc")}</div>
		),
	},
];