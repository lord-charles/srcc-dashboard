export const REQUIRED_FIELDS = [
  "companyName",
  "registrationNumber",
  "kraPin",
  "department",
  "businessAddress",
  "businessPhone",
  "businessEmail",
  "contactPerson.name",
  "contactPerson.email",
  "bankDetails.bankName",
  "bankDetails.accountNumber",
  "registrationCertificateUrl",
  "kraCertificateUrl",
  "taxComplianceCertificateUrl",
  "cr12Url",
];

export function calculateCompletion(data: any): {
  percentage: number;
  missing: string[];
} {
  const missing: string[] = [];
  let completed = 0;

  REQUIRED_FIELDS.forEach((field) => {
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

  const percentage = Math.round((completed / REQUIRED_FIELDS.length) * 100);
  return { percentage, missing };
}

export function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("contactPerson.", "Contact ")
    .replace("bankDetails.", "Bank ");
}
