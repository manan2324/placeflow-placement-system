import mongoose from "mongoose";

import { badRequest } from "@/utils/errors";

export function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

export function assertObjectId(value, { name = "id", code = "BAD_ID" } = {}) {
  if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
    throw badRequest(`Invalid ${name}`, code);
  }

  return value;
}
