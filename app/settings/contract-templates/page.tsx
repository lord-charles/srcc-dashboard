import { getContractTemplates } from "@/services/contracts.service";
import { createTemplateAction, deleteTemplateAction, updateTemplateAction } from "./actions";
import { SubmitButton, DangerSubmitButton } from "@/components/ui/submit-button";

const SAMPLE_CONTENT = `
{Date}

Contract Ref. No:

{Name of Staff}
{Department}

Dear {name}

Re: {title}

iLab in conjunction with SRCC is pleased to host you under {Project Name} on {month, year} to {month, year}

Compensation terms:
We offer a professional fee of {amount with rate eg per hour}. You are allocated {hours} for a total of {amount with currency} including taxes.

You will need to complete and sign an electronic claim form available on the system upon completion of the module.

We hope to receive a signed copy within one week from the receipt of this letter indicating your acceptance of our offer. The appointment terminates with the conclusion of the program.  Further, the program coordinator will communicate a date for a review session which should be held within two weeks from the date of the program.

We at SRCC look forward to welcoming you not only to the current programs but also to subsequent programs.

Yours sincerely,

{name}
{role}

I accept the offer:
`;

export default async function ContractTemplatesSettingsPage() {
  const templates = await getContractTemplates({ active: true }).catch(() => [] as any[]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-4">Contract Templates</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Create, edit, and delete templates. Selected templates are embedded as snapshots when awarding contracts.
        </p>
        <div className="rounded border p-4 bg-card">
          <h2 className="text-sm font-semibold mb-3">Create Template</h2>
          <form action={createTemplateAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input name="name" required className="w-full border rounded px-3 py-2 bg-background" placeholder="Standard Team Member Contract" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input name="category" className="w-full border rounded px-3 py-2 bg-background" placeholder="team_member" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <input name="version" className="w-full border rounded px-3 py-2 bg-background" placeholder="1.0.0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <select name="contentType" className="w-full border rounded px-3 py-2 bg-background" defaultValue="html">
                <option value="html">html</option>
                <option value="markdown">markdown</option>
                <option value="text">text</option>
                <option value="json">json</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Variables (CSV)</label>
              <input name="variablesCsv" className="w-full border rounded px-3 py-2 bg-background" placeholder="PROJECT_NAME,EMPLOYEE_NAME,..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Content</label>
              <textarea name="content" required className="w-full h-56 border rounded px-3 py-2 font-mono text-sm bg-background" defaultValue={SAMPLE_CONTENT} />
            </div>
            <div className="flex items-center gap-2">
              {/* Hidden ensures 'false' is submitted when unchecked */}
              <input type="hidden" name="active" value="false" />
              <input id="active" name="active" type="checkbox" defaultChecked className="h-4 w-4" />
              <label htmlFor="active" className="text-sm">Active</label>
            </div>
            <div className="md:col-span-2">
              <SubmitButton pendingText="Creating...">Create Template</SubmitButton>
            </div>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Existing Templates</h2>
        <div className="overflow-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Version & Type</th>
                <th className="text-left p-2">Variables</th>
                <th className="text-left p-2">Active</th>
                <th className="text-left p-2">Content & Actions</th>
              </tr>
            </thead>
            <tbody>
              {(templates || []).map((t: any) => (
                <tr key={t._id} className="border-t align-top">
                  <td className="p-2 w-[22%]">
                    <form action={updateTemplateAction} className="space-y-2">
                      <input type="hidden" name="id" value={t._id} />
                      <input name="name" defaultValue={t.name} className="w-full border rounded px-2 py-1 bg-background" />
                      <input name="category" defaultValue={t.category || ""} className="w-full border rounded px-2 py-1 bg-background" placeholder="category" />
                      <SubmitButton pendingText="Saving...">Save</SubmitButton>
                    </form>
                  </td>
                  <td className="p-2 w-[18%]">
                    <form action={updateTemplateAction} className="space-y-2">
                      <input type="hidden" name="id" value={t._id} />
                      <input name="version" defaultValue={t.version} className="w-full border rounded px-2 py-1 bg-background" />
                      <select name="contentType" defaultValue={t.contentType} className="w-full border rounded px-2 py-1 bg-background">
                        <option value="html">html</option>
                        <option value="markdown">markdown</option>
                        <option value="text">text</option>
                        <option value="json">json</option>
                      </select>
                      <SubmitButton pendingText="Saving...">Save</SubmitButton>
                    </form>
                  </td>
                  <td className="p-2 w-[18%]">
                    <form action={updateTemplateAction} className="space-y-2">
                      <input type="hidden" name="id" value={t._id} />
                      <input name="variablesCsv" defaultValue={(t.variables || []).join(",")} className="w-full border rounded px-2 py-1 bg-background" placeholder="variables CSV" />
                      <SubmitButton pendingText="Saving...">Save</SubmitButton>
                    </form>
                  </td>
                  <td className="p-2 w-[10%]">
                    <form action={updateTemplateAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={t._id} />
                      <input type="hidden" name="active" value="false" />
                      <input id={`active-${t._id}`} name="active" type="checkbox" defaultChecked={t.active} className="h-4 w-4" />
                      <label htmlFor={`active-${t._id}`}>Active</label>
                      <SubmitButton pendingText="Saving...">Save</SubmitButton>
                    </form>
                  </td>
                  <td className="p-2 w-[32%]">
                    <div className="space-y-2">
                      <form action={updateTemplateAction} className="space-y-2">
                        <input type="hidden" name="id" value={t._id} />
                        <textarea name="content" defaultValue={t.content} className="w-full h-36 border rounded px-2 py-1 font-mono text-xs bg-background" />
                        <SubmitButton pendingText="Updating...">Update</SubmitButton>
                      </form>
                      <form action={deleteTemplateAction}>
                        <input type="hidden" name="id" value={t._id} />
                        <DangerSubmitButton pendingText="Deleting...">Delete</DangerSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!templates || templates.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No templates yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
