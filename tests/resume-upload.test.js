const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const { startInMemoryMongo, stopInMemoryMongo, clearDatabase, resetMongooseConnection } = require('./helpers/mongo');

jest.setTimeout(30000);

const MAX_PDF_BYTES = 2 * 1024 * 1024; // Keep in sync with src/app/api/student/resume/route.js

function getFetchClasses() {
  // Jest runs in node env; File/FormData should exist on modern Node.
  // Add a fallback to undici to make tests resilient across Node/Jest versions.
  // eslint-disable-next-line global-require
  const undici = (() => {
    try {
      return require('undici');
    } catch {
      return {};
    }
  })();

  return {
    FormData: global.FormData || undici.FormData,
    File: global.File || undici.File,
    Blob: global.Blob || undici.Blob,
  };
}

function makeMultipartRequest(url, { method = 'POST', headers = {}, formData } = {}) {
  const init = {
    method,
    headers,
    body: formData,
  };

  return new Request(url, init);
}

async function cleanupUploadedUrl(url) {
  if (!url || typeof url !== 'string') return;
  if (!url.startsWith('/uploads/resumes/')) return;

  const fullPath = path.join(process.cwd(), 'public', url);
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore
  }
}

describe('Resume Upload Tests (file security)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    await startInMemoryMongo();
    await resetMongooseConnection();

    const { default: connectDB } = await import('@/lib/mongodb');
    await connectDB();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  test('PDF < limit -> pass', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/resume/route');

    const passwordHash = await bcrypt.hash('pw', 4);

    const student = await User.create({
      name: 'Resume Student',
      email: 'resume.student@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(student);

    const { FormData, File, Blob } = getFetchClasses();
    expect(FormData).toBeTruthy();

    const pdfBytes = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<<>>\nendobj\n');

    const form = new FormData();
    if (File) {
      form.append('file', new File([pdfBytes], 'resume.pdf', { type: 'application/pdf' }));
    } else {
      // Fallback: Blob + filename creates a File-like object in undici
      form.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'resume.pdf');
    }

    const req = makeMultipartRequest('http://localhost/api/student/resume', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.url).toMatch(/^\/uploads\/resumes\/[a-f0-9-]+\.pdf$/i);

    await cleanupUploadedUrl(body.url);
  });

  test('PNG -> reject', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/resume/route');

    const passwordHash = await bcrypt.hash('pw', 4);

    const student = await User.create({
      name: 'Png Student',
      email: 'png.student@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(student);

    const { FormData, File, Blob } = getFetchClasses();

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const form = new FormData();
    if (File) {
      form.append('file', new File([pngHeader], 'resume.png', { type: 'image/png' }));
    } else {
      form.append('file', new Blob([pngHeader], { type: 'image/png' }), 'resume.png');
    }

    const req = makeMultipartRequest('http://localhost/api/student/resume', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe('INVALID_FILE_TYPE');
  });

  test('PDF > limit -> reject', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/resume/route');

    const passwordHash = await bcrypt.hash('pw', 4);

    const student = await User.create({
      name: 'Large Pdf Student',
      email: 'largepdf.student@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(student);

    const { FormData, File, Blob } = getFetchClasses();

    const tooBig = Buffer.alloc(MAX_PDF_BYTES + 1, 0);
    tooBig.write('%PDF-', 0, 'utf8');

    const form = new FormData();
    if (File) {
      form.append('file', new File([tooBig], 'resume.pdf', { type: 'application/pdf' }));
    } else {
      form.append('file', new Blob([tooBig], { type: 'application/pdf' }), 'resume.pdf');
    }

    const req = makeMultipartRequest('http://localhost/api/student/resume', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe('FILE_TOO_LARGE');
  });

  test('No file -> reject', async () => {
    const { default: User } = await import('@/models/User');
    const { generateToken } = await import('@/lib/jwt');
    const { POST } = await import('@/app/api/student/resume/route');

    const passwordHash = await bcrypt.hash('pw', 4);

    const student = await User.create({
      name: 'No File Student',
      email: 'nofile.student@example.com',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    });

    const token = generateToken(student);

    const { FormData } = getFetchClasses();
    const form = new FormData();

    const req = makeMultipartRequest('http://localhost/api/student/resume', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      formData: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe('MISSING_FILE');
  });
});
