export const CONSULTANT_REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "nationalId",
  "position",
  "department",
  "department",
  // "bankDetails.bankName",
  // "bankDetails.accountNumber",
  // "emergencyContact.name",
  // "emergencyContact.phoneNumber",
];

export function calculateConsultantCompletion(data: any): {
  percentage: number;
  missing: string[];
} {
  const missing: string[] = [];
  let completed = 0;

  CONSULTANT_REQUIRED_FIELDS.forEach((field) => {
    const fieldParts = field.split(".");
    let value = data;

    for (const part of fieldParts) {
      value = value?.[part];
    }

    if (value && value !== "") {
      completed++;
    } else {
      missing.push(field);
    }
  });

  const percentage = Math.round(
    (completed / CONSULTANT_REQUIRED_FIELDS.length) * 100
  );
  return { percentage, missing };
}

export function formatConsultantFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("emergencyContact.", "Emergency ")
    .replace("bankDetails.", "Bank ")
    .replace("mpesaDetails.", "Mpesa ");
}
