import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#1E40AF",
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: "#1E40AF",
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#000",
  },
  tableCol: {
    width: "20%",
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "#000",
    padding: 5,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  rightAlign: {
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

const InvoicePDF = ({ invoice, currency }: any) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Image style={styles.logo} src="/srcc-logo.webp" />
          <Text style={styles.header}>SRCC CONSULTANCY</Text>
          <Text style={styles.subheader}>Invoice #{invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Bill To:</Text>
          <Text style={styles.text}>
            {invoice.issuedBy.firstName} {invoice.issuedBy.lastName}
          </Text>
          <Text style={styles.text}>{invoice.issuedBy.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Invoice Details:</Text>
          <Text style={styles.text}>
            Date: {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
          </Text>
          <Text style={styles.text}>
            Due Date: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
          </Text>
          <Text style={styles.text}>Payment Terms: {invoice.paymentTerms}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Items</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}>
                <Text>Description</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.rightAlign}>Quantity</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.rightAlign}>Amount</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.rightAlign}>Tax Rate</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.rightAlign}>Tax Amount</Text>
              </View>
            </View>
            {invoice.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {item.quantity}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {item.taxRate}%
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {formatCurrency(item.taxAmount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Subtotal: {formatCurrency(invoice.subtotal)}
          </Text>
          <Text style={styles.text}>
            Total Tax: {formatCurrency(invoice.totalTax)}
          </Text>
          <Text style={[styles.text, styles.bold]}>
            Total Amount: {formatCurrency(invoice.totalAmount)}
          </Text>
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Notes:</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated on {format(new Date(), "MMM d, yyyy")}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
