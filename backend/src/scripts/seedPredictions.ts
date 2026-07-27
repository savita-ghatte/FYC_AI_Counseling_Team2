import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for predictor...');

  // Create Exams
  const jee = await prisma.exam.upsert({
    where: { name: 'JEE' },
    update: {},
    create: { name: 'JEE' },
  });

  const mhtCet = await prisma.exam.upsert({
    where: { name: 'MHT-CET' },
    update: {},
    create: { name: 'MHT-CET' },
  });

  // Create Colleges
  const iitb = await prisma.college.upsert({
    where: { id: 'col-iitb' },
    update: {},
    create: {
      id: 'col-iitb',
      name: 'IIT Bombay',
      city: 'Mumbai',
      state: 'Maharashtra',
      instituteType: 'Government',
      nirfRank: 3,
      placementScore: 98,
      facultyScore: 95,
      infrastructureScore: 96,
      ownership: 'Public',
      averageFees: 250000,
      placementRate: 98.5,
    }
  });

  const dtu = await prisma.college.upsert({
    where: { id: 'col-dtu' },
    update: {},
    create: {
      id: 'col-dtu',
      name: 'Delhi Technological University',
      city: 'Delhi',
      state: 'Delhi',
      instituteType: 'Government',
      nirfRank: 35,
      placementScore: 90,
      facultyScore: 85,
      ownership: 'Public',
      averageFees: 166000,
      placementRate: 95.0,
    }
  });

  const vit = await prisma.college.upsert({
    where: { id: 'col-vit' },
    update: {},
    create: {
      id: 'col-vit',
      name: 'VIT Pune',
      city: 'Pune',
      state: 'Maharashtra',
      instituteType: 'Private',
      nirfRank: 100,
      placementScore: 85,
      facultyScore: 80,
      ownership: 'Private',
      averageFees: 185000,
      placementRate: 85.5,
    }
  });

  // Create Courses (Branches)
  const cseIitb = await prisma.course.upsert({
    where: { id: 'crs-iitb-cse' },
    update: {},
    create: { id: 'crs-iitb-cse', collegeId: iitb.id, name: 'Computer Science and Engineering', durationYears: 4, degreeType: 'B.Tech', tuitionFee: 200000 }
  });
  
  const cseDtu = await prisma.course.upsert({
    where: { id: 'crs-dtu-cse' },
    update: {},
    create: { id: 'crs-dtu-cse', collegeId: dtu.id, name: 'Computer Science', durationYears: 4, degreeType: 'B.Tech', tuitionFee: 160000 }
  });
  
  const itVit = await prisma.course.upsert({
    where: { id: 'crs-vit-it' },
    update: {},
    create: { id: 'crs-vit-it', collegeId: vit.id, name: 'Information Technology', durationYears: 4, degreeType: 'B.Tech', tuitionFee: 180000 }
  });

  // Create Historical Cutoffs
  await prisma.cutoff.deleteMany({}); // Clean up old cutoffs before seeding

  await prisma.cutoff.createMany({
    data: [
      // IIT Bombay CSE
      { examId: jee.id, courseId: cseIitb.id, year: 2023, round: 1, category: 'GEN', quotaType: 'AI', closingRank: 65, openingRank: 1 },
      { examId: jee.id, courseId: cseIitb.id, year: 2023, round: 6, category: 'GEN', quotaType: 'AI', closingRank: 67, openingRank: 1 },
      { examId: jee.id, courseId: cseIitb.id, year: 2023, round: 1, category: 'OBC', quotaType: 'AI', closingRank: 30, openingRank: 1 }, // OBC ranks are category-wise
      
      // DTU CSE
      { examId: jee.id, courseId: cseDtu.id, year: 2023, round: 1, category: 'GEN', quotaType: 'HS', stateQuota: 'Home State', closingRank: 12000 },
      { examId: jee.id, courseId: cseDtu.id, year: 2023, round: 1, category: 'GEN', quotaType: 'OS', stateQuota: 'Other State', closingRank: 5000 },

      // VIT Pune IT (MHT-CET)
      { examId: mhtCet.id, courseId: itVit.id, year: 2023, round: 1, category: 'GEN', quotaType: 'AI', closingPercentile: 98.5 },
      { examId: mhtCet.id, courseId: itVit.id, year: 2023, round: 1, category: 'OBC', quotaType: 'AI', closingPercentile: 97.0 },
      
      // Also add some JEE ranks for VIT to test
      { examId: jee.id, courseId: itVit.id, year: 2023, round: 1, category: 'GEN', quotaType: 'AI', closingRank: 25000 },
    ]
  });

  console.log('Seed completed!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
