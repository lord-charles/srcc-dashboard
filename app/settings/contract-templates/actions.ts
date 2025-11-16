"use server";

import { revalidatePath } from "next/cache";
import { createContractTemplate, deleteContractTemplate, updateContractTemplate } from "@/services/contracts.service";

export async function createTemplateAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim() || undefined;
  const version = String(formData.get("version") || "").trim() || undefined;
  const contentType = String(formData.get("contentType") || "").trim() || undefined;
  const content = String(formData.get("content") || "");
  const variablesCsv = String(formData.get("variablesCsv") || "").trim() || undefined;
  const activeValues = formData.getAll("active");
  const activeStr = activeValues.length ? String(activeValues[activeValues.length - 1]).toLowerCase() : "";
  const active = ["true", "on", "1", "yes"].includes(activeStr);

  if (!name || !content) {
    throw new Error("Name and content are required");
  }

  await createContractTemplate({ name, category, version, contentType, content, variablesCsv, active });
  revalidatePath("/settings/contract-templates");
}

export async function updateTemplateAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing template id");

  const payload: any = {};
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const version = String(formData.get("version") || "").trim();
  const contentType = String(formData.get("contentType") || "").trim();
  const content = String(formData.get("content") || "");
  const variablesCsv = String(formData.get("variablesCsv") || "").trim();
  const activeValues = formData.getAll("active");
  const activeStr = activeValues.length ? String(activeValues[activeValues.length - 1]).toLowerCase() : null;

  if (name) payload.name = name;
  if (category) payload.category = category;
  if (version) payload.version = version;
  if (contentType) payload.contentType = contentType;
  if (content) payload.content = content;
  if (variablesCsv) payload.variablesCsv = variablesCsv;
  if (activeStr !== null) payload.active = ["true", "on", "1", "yes"].includes(activeStr);

  await updateContractTemplate(id, payload);
  revalidatePath("/settings/contract-templates");
}

export async function deleteTemplateAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing template id");
  await deleteContractTemplate(id);
  revalidatePath("/settings/contract-templates");
}
