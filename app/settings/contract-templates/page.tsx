import { getContractTemplates } from "@/services/contracts.service";
import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateAction,
} from "./actions";
import {
  SubmitButton,
  DangerSubmitButton,
} from "@/components/ui/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SAMPLE_TEAM_MEMBER_CONTENT = `
{Date}

Contract Ref. No:

{Name of Staff}
{Department}

Dear {name}

Re: {title}

iLab in conjunction with SRCC is pleased to host you under {Project Name} on {month-start, year-start} to {month-end, year-end}


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

const SAMPLE_COACH_CONTENT = `
{Date}

Ref. No: EM/COACHING/{Date}/2025

{Coach Name}
Adjunct Coach
Strathmore Business School

Dear {Coach Title} {Coach Last Name}

Re: Program Specific Adjunct Coach Appointment with Strathmore Business School (SBS) and Strathmore Research and Consultancy Centre Ltd. (SRCC)

Strathmore University Business School (SBS) in conjunction with SRCC is pleased to host you as an adjunct Coach.

The program coordinator will gladly assist you with any questions regarding this appointment. SBS & SRCC aspire to have dedicated staff members who set high moral, professional and disciplinary standards. A copy of our University staff handbook, which we strongly recommend you go through before embarking on your classes, is available from the program coordinator.

Compensation
a) You will be paid at the rate of {Currency} {Rate} per {Rate Unit}.
b) You will be required to fill a claim form for hours worked in liaison with your program manager and submit the same for approval and payment processing.

If for any reason SRCC is dissatisfied with performance of this Contract, an appropriate sum may be withheld from the payment that would otherwise be due under this Contract. In such event SRCC shall identify the particular Services with which it is dissatisfied together with the reasons for such dissatisfaction, and payment of the amount outstanding will be made upon remedy of any such unsatisfactory work or resolution of outstanding queries.

5. Termination:
This contract shall be in force until the {End Date} unless terminated by either party before the said date by giving two weeks' notice. SRCC ltd. may terminate this contract on the following grounds:
i) Failure by the Consultant to deliver work within the stipulated timelines.
ii) Breach of confidentiality or any intellectual property rights belonging to SRCC or any of its affiliated parties/clients.
iii) Breach of any clause of this agreement or the agreement with the client.

6. Confidentiality Agreement
The Consultant shall be expected to execute a confidentiality and non-disclosure agreement whose terms and conditions shall be enforceable during the tenure of this contract and shall survive and remain in force after its termination until and unless waived or rescinded in writing by SRCC ltd.

7. Property Rights
All documents emanating from this assignment shall be the property of SRCC and duplication or use to any third party will be forbidden unless with direct approval in writing by SRCC.

8. Applicable law
This agreement shall be governed by the laws of the Republic of Kenya. In case a dispute arises, the parties shall endeavour to resolve it amicably through mediation, arbitration in accordance with the laws of Kenya before invoking any judicial tribunal in the Republic of Kenya.

You will need to complete and sign a payment claim form available from Strathmore Research and Consultancy Centre Ltd.

We hope to receive a signed copy of this contract within two days from the receipt of this letter indicating your acceptance of our offer.

Yours sincerely,


{name}
{role}

I accept the offer:
`;

export default async function ContractTemplatesSettingsPage() {
  const allTemplates = await getContractTemplates({ active: true }).catch(
    () => [] as any[],
  );

  // Separate templates by category
  const teamMemberTemplates = allTemplates.filter(
    (t: any) =>
      !t.category ||
      t.category === "team_member" ||
      t.category === "consultant",
  );
  const coachTemplates = allTemplates.filter(
    (t: any) => t.category === "coach",
  );

  const renderTemplateForm = (
    category: "team_member" | "coach",
    sampleContent: string,
  ) => (
    <div className="rounded border p-4 bg-card">
      <h2 className="text-sm font-semibold mb-3">
        Create {category === "team_member" ? "Team Member/Consultant" : "Coach"}{" "}
        Template
      </h2>
      <form
        action={createTemplateAction}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            required
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder={
              category === "team_member"
                ? "Standard Team Member Contract"
                : "Standard Coach Contract"
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <input
            name="category"
            className="w-full border rounded px-3 py-2 bg-background"
            value={category}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Version</label>
          <input
            name="version"
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder="1.0.0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Type</label>
          <select
            name="contentType"
            className="w-full border rounded px-3 py-2 bg-background"
            defaultValue="html"
          >
            <option value="html">html</option>
            <option value="markdown">markdown</option>
            <option value="text">text</option>
            <option value="json">json</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Variables (CSV)</label>
          <input
            name="variablesCsv"
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder={
              category === "team_member"
                ? "PROJECT_NAME,EMPLOYEE_NAME,AMOUNT,CURRENCY"
                : "COACH_NAME,RATE,RATE_UNIT,CURRENCY,START_DATE,END_DATE"
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Content</label>
          <textarea
            name="content"
            required
            className="w-full h-56 border rounded px-3 py-2 font-mono text-sm bg-background"
            defaultValue={sampleContent}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="active" value="false" />
          <input
            id={`active-${category}`}
            name="active"
            type="checkbox"
            defaultChecked
            className="h-4 w-4"
          />
          <label htmlFor={`active-${category}`} className="text-sm">
            Active
          </label>
        </div>
        <div className="md:col-span-2">
          <SubmitButton pendingText="Creating...">Create Template</SubmitButton>
        </div>
      </form>
    </div>
  );

  const renderTemplatesTable = (templates: any[]) => (
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
          {templates.map((t: any) => (
            <tr key={t._id} className="border-t align-top">
              <td className="p-2 w-[22%]">
                <form action={updateTemplateAction} className="space-y-2">
                  <input type="hidden" name="id" value={t._id} />
                  <input
                    name="name"
                    defaultValue={t.name}
                    className="w-full border rounded px-2 py-1 bg-background"
                  />
                  <input
                    name="category"
                    defaultValue={t.category || ""}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="category"
                  />
                  <SubmitButton pendingText="Saving...">Save</SubmitButton>
                </form>
              </td>
              <td className="p-2 w-[18%]">
                <form action={updateTemplateAction} className="space-y-2">
                  <input type="hidden" name="id" value={t._id} />
                  <input
                    name="version"
                    defaultValue={t.version}
                    className="w-full border rounded px-2 py-1 bg-background"
                  />
                  <select
                    name="contentType"
                    defaultValue={t.contentType}
                    className="w-full border rounded px-2 py-1 bg-background"
                  >
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
                  <input
                    name="variablesCsv"
                    defaultValue={(t.variables || []).join(",")}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="variables CSV"
                  />
                  <SubmitButton pendingText="Saving...">Save</SubmitButton>
                </form>
              </td>
              <td className="p-2 w-[10%]">
                <form
                  action={updateTemplateAction}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={t._id} />
                  <input type="hidden" name="active" value="false" />
                  <input
                    id={`active-${t._id}`}
                    name="active"
                    type="checkbox"
                    defaultChecked={t.active}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`active-${t._id}`}>Active</label>
                  <SubmitButton pendingText="Saving...">Save</SubmitButton>
                </form>
              </td>
              <td className="p-2 w-[32%]">
                <div className="space-y-2">
                  <form action={updateTemplateAction} className="space-y-2">
                    <input type="hidden" name="id" value={t._id} />
                    <textarea
                      name="content"
                      defaultValue={t.content}
                      className="w-full h-36 border rounded px-2 py-1 font-mono text-xs bg-background"
                    />
                    <SubmitButton pendingText="Updating...">
                      Update
                    </SubmitButton>
                  </form>
                  <form action={deleteTemplateAction}>
                    <input type="hidden" name="id" value={t._id} />
                    <DangerSubmitButton pendingText="Deleting...">
                      Delete
                    </DangerSubmitButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                No templates yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-4">Contract Templates</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Create, edit, and delete templates. Selected templates are embedded as
          snapshots when awarding contracts. Templates are categorized by type
          for different contract requirements.
        </p>

        <Tabs defaultValue="team_member" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team_member">
              Team Members / Consultants
            </TabsTrigger>
            <TabsTrigger value="coach">Coaches</TabsTrigger>
          </TabsList>

          <TabsContent value="team_member" className="space-y-6">
            {renderTemplateForm("team_member", SAMPLE_TEAM_MEMBER_CONTENT)}

            <div>
              <h2 className="text-sm font-semibold mb-3">
                Team Member & Consultant Templates
              </h2>
              {renderTemplatesTable(teamMemberTemplates)}
            </div>
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            {renderTemplateForm("coach", SAMPLE_COACH_CONTENT)}

            <div>
              <h2 className="text-sm font-semibold mb-3">Coach Templates</h2>
              {renderTemplatesTable(coachTemplates)}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
