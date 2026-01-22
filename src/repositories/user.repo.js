import User from "@/models/User";

export async function findUserByEmail(email, { session } = {}) {
  const q = User.findOne({ email });
  if (session) q.session(session);
  return q;
}

export async function findUserById(userId, { session } = {}) {
  const q = User.findById(userId);
  if (session) q.session(session);
  return q;
}

export async function createUser(userData, { session } = {}) {
  if (session) {
    const [created] = await User.create([userData], { session });
    return created;
  }
  return User.create(userData);
}
