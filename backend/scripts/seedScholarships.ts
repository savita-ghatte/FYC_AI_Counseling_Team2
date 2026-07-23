import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCHOLARSHIPS = [
  {
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC)',
    provider: 'MahaDBT - DTE Maharashtra',
    category: 'EWS',
    type: 'Government (MahaDBT)',
    amountMax: 50000,
    applicationMode: 'Online',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    eligibilityCriteria: 'Candidate must be domiciled in Maharashtra. Family income must be less than 8 Lakhs. Admitted through CAP rounds.',
    requiredDocuments: ['Domicile Certificate', 'Income Certificate', 'CAP Allotment Letter', 'Aadhaar Card'],
    deadline: new Date(new Date().getFullYear(), 10, 30), // Nov 30th
    isActive: true
  },
  {
    name: 'Dr. Punjabrao Deshmukh Vastigruh Nirvah Bhatta Yojna',
    provider: 'MahaDBT - DTE Maharashtra',
    category: 'EWS',
    type: 'Government (MahaDBT)',
    amountMax: 30000,
    applicationMode: 'Online',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    eligibilityCriteria: 'Candidate must be a child of registered labor or Alpabhudharak Shetkari. Maximum income 8 Lakhs.',
    requiredDocuments: ['Hostel Certificate', 'Income Certificate', 'Alpabhudharak Shetkari Certificate', 'Aadhaar Card'],
    deadline: new Date(new Date().getFullYear(), 10, 30),
    isActive: true
  },
  {
    name: 'Post Matric Scholarship for OBC Students',
    provider: 'MahaDBT - VJNT, OBC and SBC Welfare Department',
    category: 'OBC',
    type: 'Government (MahaDBT)',
    amountMax: 100000,
    applicationMode: 'Online',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    eligibilityCriteria: 'Must belong to OBC category in Maharashtra. Family income less than 1 Lakh (for 100% scholarship) or less than 8 Lakhs (for Freeship).',
    requiredDocuments: ['Caste Certificate', 'Caste Validity', 'Non-Creamy Layer Certificate', 'Income Certificate'],
    deadline: new Date(new Date().getFullYear(), 11, 31),
    isActive: true
  },
  {
    name: 'Government of India Post-Matric Scholarship for SC Students',
    provider: 'MahaDBT - Social Justice and Special Assistance',
    category: 'SC',
    type: 'Government (MahaDBT)',
    amountMax: 150000,
    applicationMode: 'Online',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    eligibilityCriteria: 'Must belong to SC category. Family income less than 2.5 Lakhs.',
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Bank Passbook', 'Aadhaar Card'],
    deadline: new Date(new Date().getFullYear(), 11, 31),
    isActive: true
  },
  {
    name: 'Central Sector Scheme of Scholarships for College and University Students',
    provider: 'NSP - Department of Higher Education',
    category: 'GEN',
    type: 'Government (NSP Central)',
    amountMax: 20000,
    applicationMode: 'Online',
    applicationUrl: 'https://scholarships.gov.in',
    eligibilityCriteria: 'Students who are above 80th percentile of successful candidates in the relevant stream from a particular Board of Examination in Class XII. Family income less than 4.5 Lakhs.',
    requiredDocuments: ['12th Marksheet', 'Income Certificate', 'Aadhaar Card', 'College Bonafide'],
    deadline: new Date(new Date().getFullYear(), 9, 31),
    isActive: true
  },
  {
    name: 'Pragati Scholarship Scheme for Girls (Degree)',
    provider: 'NSP - AICTE',
    category: 'GEN',
    type: 'Government (NSP Central)',
    amountMax: 50000,
    applicationMode: 'Online',
    applicationUrl: 'https://scholarships.gov.in',
    eligibilityCriteria: 'Maximum two girl child per family. Family income less than 8 Lakhs. Admitted to AICTE approved institution.',
    requiredDocuments: ['Income Certificate', 'Promotion Certificate', 'Tuition Fee Receipt', 'Aadhaar Card'],
    deadline: new Date(new Date().getFullYear(), 10, 30),
    isActive: true
  }
];

async function seedScholarships() {
  console.log('🌱 Seeding Accurate MahaDBT & NSP Scholarships...');
  
  // Clear existing scholarships to prevent duplicates
  await prisma.scholarship.deleteMany({});
  
  for (const scholarship of SCHOLARSHIPS) {
    await prisma.scholarship.create({
      data: scholarship
    });
    console.log(`✅ Added: ${scholarship.name}`);
  }
  
  console.log('🎉 Scholarship Seeding Complete!');
}

seedScholarships()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
