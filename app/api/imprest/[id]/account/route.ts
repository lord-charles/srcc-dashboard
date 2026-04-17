import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(`${API_URL}/imprest/${params.id}/account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Imprest accounting proxy error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
