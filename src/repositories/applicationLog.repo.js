import ApplicationLog from "@/models/ApplicationLog";

export async function createApplicationLog(logData, { session } = {}) {
  if (session) {
    const [created] = await ApplicationLog.create([logData], { session });
    return created;
  }
  return ApplicationLog.create(logData);
}
