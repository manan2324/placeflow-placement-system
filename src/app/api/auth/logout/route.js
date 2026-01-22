import { json } from "@/utils/apiResponse";

export async function POST() {
    return json({ message: "Logout successful" }, { status: 200 });
}