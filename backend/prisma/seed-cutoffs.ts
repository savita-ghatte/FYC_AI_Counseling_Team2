import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cutoffs and Courses...');

  // Get Top 10 Colleges to seed
  const colleges = await prisma.college.findMany({ take: 10 });
  if (colleges.length === 0) {
    console.log('No colleges found, please run seed.ts first');
    return;
  }

  const branches = [
    { name: 'Computer Science', fee: 150000 },
    { name: 'Information Technology', fee: 140000 },
    { name: 'Mechanical Engineering', fee: 120000 },
    { name: 'Electronics and Communication', fee: 130000 },
  ];

  const categories = ['GEN', 'OBC', 'SC', 'ST', 'EWS'];

  for (const college of colleges) {
    for (const branch of branches) {
      // Create Course
      const course = await prisma.course.create({
        data: {
          collegeId: college.id,
          name: branch.name,
          tuitionFee: branch.fee,
          durationYears: 4,
          totalIntake: 120,
        },
      });

      // Create Cutoffs for the last 3 years
      for (const year of [2023, 2024, 2025]) {
        for (const category of categories) {
          
          // Generate realistic mock ranks based on branch & college type
          // Top IIT CS -> 500 rank. State IT -> 15000 rank.
          let baseRank = 5000;
          if (college.name.includes('IIT')) baseRank = 1000;
          else if (college.name.includes('NIT')) baseRank = 3000;
          
          if (branch.name === 'Computer Science') baseRank *= 0.5;
          if (category === 'OBC') baseRank *= 2.5;
          if (category === 'SC') baseRank *= 6.0;
          if (category === 'ST') baseRank *= 10.0;
          if (category === 'EWS') baseRank *= 1.5;

          baseRank = Math.floor(baseRank + (Math.random() * 500 - 250)); // Add noise

          const basePercentile = Math.min(99.9, 100 - (baseRank / 10000));

          await prisma.cutoff.create({
            data: {
              courseId: course.id,
              year,
              round: 1,
              category,
              quotaType: 'AI', // All India
              genderQuota: 'Gender-Neutral',
              openingRank: Math.floor(baseRank * 0.8),
              closingRank: Math.floor(baseRank * 1.2),
              openingPercentile: Math.min(99.9, basePercentile + 0.5),
              closingPercentile: Math.max(10.0, basePercentile - 0.5),
            }
          });
        }
      }
    }
    console.log(`Seeded courses & cutoffs for ${college.name}`);
  }

  console.log('Finished seeding cutoffs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
