import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aicounsellor.in' },
    update: {},
    create: {
      email: 'admin@aicounsellor.in',
      role: 'admin',
      isVerified: true,
      passwordHash: 'hashed_password_mock',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Student User & Profile
  const student = await prisma.user.upsert({
    where: { email: 'student@aicounsellor.in' },
    update: {},
    create: {
      email: 'student@aicounsellor.in',
      role: 'student',
      isVerified: true,
      studentProfile: {
        create: {
          fullName: 'John Doe',
          category: 'GEN',
          homeState: 'Maharashtra',
          percentage12th: 92.5,
          preferredBranches: ['Computer Science', 'Information Technology'],
        },
      },
    },
  });
  console.log(`Created student: ${student.email}`);

  // Create College
  const college = await prisma.college.create({
    data: {
      name: 'National Institute of Technology, Trichy',
      shortName: 'NIT Trichy',
      instituteType: 'nit',
      state: 'Tamil Nadu',
      city: 'Tiruchirappalli',
      nirfRank: 9,
      courses: {
        create: [
          {
            name: 'Computer Science and Engineering',
            branchCode: 'CSE',
            degreeType: 'B.Tech',
            totalIntake: 120,
          },
        ],
      },
    },
  });
  console.log(`Created college: ${college.name}`);

  // Create Cutoff for the course
  const course = await prisma.course.findFirst({
    where: { collegeId: college.id },
  });

  if (course) {
    await prisma.cutoff.create({
      data: {
        courseId: course.id,
        year: 2024,
        round: 1,
        category: 'GEN',
        quotaType: 'OS',
        openingRank: 500,
        closingRank: 1500,
      },
    });
    console.log(`Created cutoff for course: ${course.name}`);
  }

  // Create Scholarships matching the design
  const scholarshipsData = [
    {
      name: 'PM Uchchatar Shiksha Protsahan (PM-USP) Central Sector Scheme',
      provider: 'Department of Higher Education',
      category: 'GEN',
      type: 'Central',
      amountMax: 20000,
      eligibilityCriteria: 'Scored above 80th percentile in Class 12 board, pursuing regular degree course, family income under ₹4.5 Lakhs.',
      requiredDocuments: ['Class 12 Marksheet', 'Income Certificate', 'Aadhaar Card', 'College Admission Proof'],
      deadline: new Date(new Date().getFullYear(), 10, 30), // 30th November
      applicationUrl: 'https://scholarships.gov.in',
    },
    {
      name: 'Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement Scheme (EBC Maharashtra)',
      provider: 'Government of Maharashtra',
      category: 'EWS',
      type: 'State',
      amountMax: 100000,
      eligibilityCriteria: 'Domicile of Maharashtra, admitted through CAP Round, General/EWS category, family income under ₹8.0 Lakhs.',
      requiredDocuments: ['CAP Admission Letter', 'Income Certificate issued by Tehsildar', 'Domicile Certificate', 'Aadhaar Link Bank Passbook'],
      deadline: new Date(new Date().getFullYear(), 11, 31), // 31st December
      applicationUrl: 'https://mahadbtmahait.gov.in',
    },
    {
      name: 'Reliance Foundation Undergraduate Scholarships',
      provider: 'Reliance Foundation',
      category: 'GEN',
      type: 'Private',
      amountMax: 200000,
      eligibilityCriteria: 'Meritorious students based on aptitude test, pursuing full-time UG courses, family income under ₹15 Lakhs (preference to under ₹2.5 Lakhs).',
      requiredDocuments: ['12th Marksheet', 'College ID', 'Income Proof', 'Aptitude Test Score'],
      deadline: new Date(new Date().getFullYear(), 9, 15), // 15th October
      applicationUrl: 'https://scholarships.reliancefoundation.org',
    }
  ];

  for (const s of scholarshipsData) {
    await prisma.scholarship.create({
      data: s,
    });
    console.log(`Created scholarship: ${s.name}`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
