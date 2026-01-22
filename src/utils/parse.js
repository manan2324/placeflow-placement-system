import { badRequest } from "./errors";

export async function parseJson(req) {
  try {
    return await req.json();
  } catch {
    throw badRequest("Invalid JSON body", "INVALID_JSON");
  }
}
