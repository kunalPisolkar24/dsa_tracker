import { getAuth } from "@/lib/auth/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return getAuth().handler().GET(request, { params });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return getAuth().handler().POST(request, { params });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return getAuth().handler().PUT(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return getAuth().handler().DELETE(request, { params });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return getAuth().handler().PATCH(request, { params });
}
