import { NextRequest, NextResponse } from "next/server";

// ⚠️ KOREKSI BASE_URL: Gunakan '/token' dan port NestJS yang benar
const BASE_URL = "http://localhost:3010/antrian"; 

export async function GET() {
  const res = await fetch(`${BASE_URL}/display`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action;
  let url = BASE_URL;
  let options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };

switch (action) {
  case "new":
    url = `${BASE_URL}/generate`;
    options.body = JSON.stringify(body);
    break;

  case "call":
    url = `${BASE_URL}/call`;
    options.body = JSON.stringify(body);
    break;

  case "repeat":
    url = `${BASE_URL}/repeat`;
    options.body = JSON.stringify(body);
    break;

  case "skip":
    url = `${BASE_URL}/skip`;
    options.body = JSON.stringify(body);
    break;

  case "finish":
    url = `${BASE_URL}/finish`;
    options.body = JSON.stringify(body);
    break;

  case "waiting":
  case "current":
    options.method = "GET";
    delete options.body;
    url = action === "waiting" ? `${BASE_URL}/waiting` : `${BASE_URL}/display`;
    break;

  default:
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

  const res = await fetch(url, options);
  const data = await res.json();
  return NextResponse.json(data);
}