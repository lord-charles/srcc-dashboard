import { Advance } from "@/types/advance";

export interface AdvanceStats {
  totalAdvances: number;
  totalAmountDisbursed: number;
  pendingApprovals: {
    count: number;
    urgentCount: number;
  };
  averageRepaymentPeriod: number;
  activeAdvances: {
    count: number;
    percentageOfEmployees: number;
  };
}

export function calculateAdvanceStats(
  advances: Advance[],
  totalEmployees: number
): AdvanceStats {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

  // Total advances in current month
  const currentMonthAdvances = advances.filter(
    (advance) => new Date(advance.createdAt) > lastMonth
  );

  // Calculate total amount disbursed
  const totalAmountDisbursed = advances.reduce(
    (sum, advance) => sum + advance.amount,
    0
  );

  // Calculate pending approvals
  const pendingAdvances = advances.filter(
    (advance) => advance.status === "pending"
  );

  // Consider requests urgent if they're pending for more than 48 hours
  const urgentRequests = pendingAdvances.filter((advance) => {
    const requestAge =
      now.getTime() - new Date(advance.requestedDate).getTime();
    return requestAge > 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  });

  // Calculate average repayment period
  const totalRepaymentPeriods = advances.reduce(
    (sum, advance) => sum + advance.repaymentPeriod,
    0
  );
  const averageRepaymentPeriod =
    advances.length > 0 ? totalRepaymentPeriods / advances.length : 0;

  // Calculate active advances (those with status 'repaying')
  const activeAdvances = advances.filter(
    (advance) => advance.status === "repaying"
  );

  // Calculate percentage of employees with active advances
  const uniqueEmployeesWithAdvances = new Set(
    activeAdvances.map((advance) => advance.employee)
  );
  const percentageOfEmployees =
    (uniqueEmployeesWithAdvances.size / totalEmployees) * 100;

  return {
    totalAdvances: currentMonthAdvances.length,
    totalAmountDisbursed,
    pendingApprovals: {
      count: pendingAdvances.length,
      urgentCount: urgentRequests.length,
    },
    averageRepaymentPeriod,
    activeAdvances: {
      count: activeAdvances.length,
      percentageOfEmployees,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
