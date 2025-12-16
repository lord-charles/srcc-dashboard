const API_BASE_URL = "https://innova.cognitron.co.ke/srcc/api";
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODc3YjRiMzM5ODZjYjkyNjFhM2Y1MDgiLCJlbWFpbCI6ImNtaWh1bnlvQHN0cmF0aG1vcmUuZWR1Iiwicm9sZXMiOlsiY29uc3VsdGFudCIsImFkbWluIl0sImZpcnN0TmFtZSI6IkNoYXJsZXMiLCJsYXN0TmFtZSI6Im13YW5pa2kiLCJkZXBhcnRtZW50IjoiZW5naW5lZXJpbmdfdGVjaG5vbG9neSIsInJlZ2lzdHJhdGlvblN0YXR1cyI6ImNvbXBsZXRlIiwicGhvbmVOdW1iZXIiOiIyNTQ3NDAzMTU1NDUiLCJzdGF0dXMiOiJhY3RpdmUiLCJpYXQiOjE3NTMxNTY0MzMsImV4cCI6MTc1MzI0MjgzM30.NXto0InuLZQbccTYTQVvhiWoNIG_P2xOl-SLOTVqDOA";

export const consultantApiService = {
  async getConsultant(id: string) {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      headers: {
        Authorization: AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to fetch consultant: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },

  async updateConsultant(id: string, data: any) {
    const response = await fetch(
      `${API_BASE_URL}/consultants/consultant/update/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update consultant: ${response.statusText}`);
    }

    return response.json();
  },
};
