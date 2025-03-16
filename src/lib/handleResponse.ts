import { NextResponse } from "next/server";

const handleResponse = (message: string, status: number) => {
  return NextResponse.json({ message }, { status });
};

export default handleResponse;
