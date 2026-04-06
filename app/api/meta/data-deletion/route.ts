import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { withBasePath } from "@/lib/config/base-path";

function buildStatusUrl(request: Request, confirmationCode: string) {
  const url = new URL(withBasePath("/data-deletion-status"), request.url);
  url.searchParams.set("confirmation_code", confirmationCode);
  return url.toString();
}

export async function GET(request: Request) {
  const confirmationCode = new URL(request.url).searchParams.get("confirmation_code") ?? "pending";

  return NextResponse.json({
    success: true,
    confirmation_code: confirmationCode,
    message: "Meta data deletion callback endpoint is online."
  });
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const signedRequest = String(formData?.get("signed_request") ?? "");
  const confirmationCode = randomUUID();

  return NextResponse.json({
    url: buildStatusUrl(request, confirmationCode),
    confirmation_code: confirmationCode,
    signed_request_received: Boolean(signedRequest)
  });
}
