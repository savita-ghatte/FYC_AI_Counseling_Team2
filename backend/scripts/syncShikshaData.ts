import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated payload from a "Shiksha API / Scraper"
const SHIKSHA_DATA = [
  {
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IITB',
    instituteType: 'Government',
    state: 'Maharashtra',
    city: 'Mumbai',
    nirfRank: 3,
    naacGrade: 'A++',
    websiteUrl: 'https://www.iitb.ac.in',
    placements: {
      averagePackage: 2350000,
      highestPackage: 15000000,
      topRecruiters: ['Google', 'Microsoft', 'Jane Street', 'Optiver']
    },
    courses: [
      { name: 'Computer Science and Engineering', tuitionFee: 200000, hostelFee: 50000, branchCode: 'CSE' },
      { name: 'Electrical Engineering', tuitionFee: 200000, hostelFee: 50000, branchCode: 'EE' }
    ]
  },
  {
    name: 'College of Engineering Pune',
    shortName: 'COEP',
    instituteType: 'Government-Aided',
    state: 'Maharashtra',
    city: 'Pune',
    nirfRank: 73,
    naacGrade: 'A+',
    websiteUrl: 'https://www.coep.org.in',
    placements: {
      averagePackage: 1120000,
      highestPackage: 5000000,
      topRecruiters: ['TCS', 'Infosys', 'Bajaj Auto', 'Credit Suisse']
    },
    courses: [
      { name: 'Computer Engineering', tuitionFee: 90000, hostelFee: 35000, branchCode: 'COMP' },
      { name: 'Mechanical Engineering', tuitionFee: 90000, hostelFee: 35000, branchCode: 'MECH' }
    ]
  },
  {
    name: 'Veermata Jijabai Technological Institute',
    shortName: 'VJTI',
    instituteType: 'Government-Aided',
    state: 'Maharashtra',
    city: 'Mumbai',
    nirfRank: 84,
    naacGrade: 'A',
    websiteUrl: 'https://vjti.ac.in',
    placements: {
      averagePackage: 1050000,
      highestPackage: 6200000,
      topRecruiters: ['Morgan Stanley', 'Amazon', 'L&T', 'Samsung']
    },
    courses: [
      { name: 'Information Technology', tuitionFee: 85000, hostelFee: 30000, branchCode: 'IT' }
    ]
  }
];

async function syncShikshaData() {
  console.log('🔄 Starting Simulated Shiksha.com Data Sync...');
  
  for (const data of SHIKSHA_DATA) {
    let college = await prisma.college.findFirst({
      where: { OR: [{ name: data.name }, { shortName: data.shortName }] }
    });

    if (!college) {
      college = await prisma.college.create({
        data: {
          name: data.name,
          shortName: data.shortName,
          instituteType: data.instituteType,
          state: data.state,
          city: data.city,
          nirfRank: data.nirfRank,
          naacGrade: data.naacGrade,
          websiteUrl: data.websiteUrl
        }
      });
      console.log(`[NEW] Created College: ${college.name}`);
    } else {
      college = await prisma.college.update({
        where: { id: college.id },
        data: {
          nirfRank: data.nirfRank,
          naacGrade: data.naacGrade,
          websiteUrl: data.websiteUrl
        }
      });
      console.log(`[UPDATE] Updated College: ${college.name}`);
    }

    // Sync Placements
    const existingPlacement = await prisma.placement.findFirst({
      where: { collegeId: college.id, year: new Date().getFullYear() }
    });

    if (!existingPlacement) {
      await prisma.placement.create({
        data: {
          collegeId: college.id,
          year: new Date().getFullYear(),
          averagePackage: data.placements.averagePackage,
          highestPackage: data.placements.highestPackage,
          topRecruiters: data.placements.topRecruiters
        }
      });
      console.log(`   └─ Synced Placements for ${college.shortName}`);
    }

    // Sync Courses
    for (const course of data.courses) {
      const existingCourse = await prisma.course.findFirst({
        where: { collegeId: college.id, name: course.name }
      });

      if (!existingCourse) {
        await prisma.course.create({
          data: {
            collegeId: college.id,
            name: course.name,
            branchCode: course.branchCode,
            tuitionFee: course.tuitionFee,
            hostelFee: course.hostelFee
          }
        });
        console.log(`   └─ Added Course: ${course.name}`);
      }
    }
  }

  console.log('✅ Shiksha.com Data Sync Completed Successfully!');
}

syncShikshaData()
  .catch(e => {
    console.error('Failed to sync data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
