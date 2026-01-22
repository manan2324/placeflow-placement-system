import Company from "@/models/Company";

export async function findCompanyById(companyId, { session } = {}) {
  const q = Company.findById(companyId);
  if (session) q.session(session);
  return q;
}

export async function findCompanyByName(name, { session } = {}) {
  const q = Company.findOne({ name });
  if (session) q.session(session);
  return q;
}

export async function listCompanies(filter = {}, { session } = {}) {
  const q = Company.find(filter).sort({ applicationDeadline: 1 });
  if (session) q.session(session);
  return q;
}

export async function countCompanies(filter = {}, { session } = {}) {
  const q = Company.countDocuments(filter);
  if (session) q.session(session);
  return q;
}

export async function createCompany(companyData, { session } = {}) {
  if (session) {
    const [created] = await Company.create([companyData], { session });
    return created;
  }
  return Company.create(companyData);
}

export async function updateCompanyStatus(companyId, status, { session } = {}) {
  const q = Company.findByIdAndUpdate(companyId, { status }, { new: true });
  if (session) q.session(session);
  return q;
}
