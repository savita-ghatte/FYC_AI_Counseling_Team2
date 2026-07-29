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

  console.log('Wiping existing colleges to prevent duplicates...');
  await prisma.college.deleteMany({});

  const collegesData = [
  {
    "name": "Indian Institute of Technology Bombay",
    "shortName": "IIT Bombay",
    "state": "Maharashtra",
    "city": "Mumbai",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Delhi",
    "shortName": "IIT Delhi",
    "state": "Delhi",
    "city": "New Delhi",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Kanpur",
    "shortName": "IIT Kanpur",
    "state": "Uttar Pradesh",
    "city": "Kanpur",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Kharagpur",
    "shortName": "IIT Kharagpur",
    "state": "West Bengal",
    "city": "Kharagpur",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Madras",
    "shortName": "IIT Madras",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Roorkee",
    "shortName": "IIT Roorkee",
    "state": "Uttarakhand",
    "city": "Roorkee",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Guwahati",
    "shortName": "IIT Guwahati",
    "state": "Assam",
    "city": "Guwahati",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Hyderabad",
    "shortName": "IIT Hyderabad",
    "state": "Telangana",
    "city": "Hyderabad",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Indore",
    "shortName": "IIT Indore",
    "state": "Madhya Pradesh",
    "city": "Indore",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology BHU Varanasi",
    "shortName": "IIT BHU",
    "state": "Uttar Pradesh",
    "city": "Varanasi",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology ISM Dhanbad",
    "shortName": "IIT ISM",
    "state": "Jharkhand",
    "city": "Dhanbad",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Bhubaneswar",
    "shortName": "IIT Bhubaneswar",
    "state": "Odisha",
    "city": "Bhubaneswar",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Gandhinagar",
    "shortName": "IIT Gandhinagar",
    "state": "Gujarat",
    "city": "Gandhinagar",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Jodhpur",
    "shortName": "IIT Jodhpur",
    "state": "Rajasthan",
    "city": "Jodhpur",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Patna",
    "shortName": "IIT Patna",
    "state": "Bihar",
    "city": "Patna",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Ropar",
    "shortName": "IIT Ropar",
    "state": "Punjab",
    "city": "Rupnagar",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Mandi",
    "shortName": "IIT Mandi",
    "state": "Himachal Pradesh",
    "city": "Mandi",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Palakkad",
    "shortName": "IIT Palakkad",
    "state": "Kerala",
    "city": "Palakkad",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Tirupati",
    "shortName": "IIT Tirupati",
    "state": "Andhra Pradesh",
    "city": "Tirupati",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Bhilai",
    "shortName": "IIT Bhilai",
    "state": "Chhattisgarh",
    "city": "Bhilai",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Goa",
    "shortName": "IIT Goa",
    "state": "Goa",
    "city": "Ponda",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Jammu",
    "shortName": "IIT Jammu",
    "state": "Jammu and Kashmir",
    "city": "Jammu",
    "type": "iit"
  },
  {
    "name": "Indian Institute of Technology Dharwad",
    "shortName": "IIT Dharwad",
    "state": "Karnataka",
    "city": "Dharwad",
    "type": "iit"
  },
  {
    "name": "National Institute of Technology Tiruchirappalli",
    "shortName": "NIT Trichy",
    "state": "Tamil Nadu",
    "city": "Tiruchirappalli",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Karnataka",
    "shortName": "NIT Surathkal",
    "state": "Karnataka",
    "city": "Mangalore",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Warangal",
    "shortName": "NIT Warangal",
    "state": "Telangana",
    "city": "Warangal",
    "type": "nit"
  },
  {
    "name": "Malaviya National Institute of Technology",
    "shortName": "MNIT Jaipur",
    "state": "Rajasthan",
    "city": "Jaipur",
    "type": "nit"
  },
  {
    "name": "Motilal Nehru National Institute of Technology",
    "shortName": "MNNIT Allahabad",
    "state": "Uttar Pradesh",
    "city": "Prayagraj",
    "type": "nit"
  },
  {
    "name": "Visvesvaraya National Institute of Technology",
    "shortName": "VNIT Nagpur",
    "state": "Maharashtra",
    "city": "Nagpur",
    "type": "nit"
  },
  {
    "name": "Sardar Vallabhbhai National Institute of Technology",
    "shortName": "SVNIT Surat",
    "state": "Gujarat",
    "city": "Surat",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Calicut",
    "shortName": "NIT Calicut",
    "state": "Kerala",
    "city": "Kozhikode",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Rourkela",
    "shortName": "NIT Rourkela",
    "state": "Odisha",
    "city": "Rourkela",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Kurukshetra",
    "shortName": "NIT Kurukshetra",
    "state": "Haryana",
    "city": "Kurukshetra",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Silchar",
    "shortName": "NIT Silchar",
    "state": "Assam",
    "city": "Silchar",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Durgapur",
    "shortName": "NIT Durgapur",
    "state": "West Bengal",
    "city": "Durgapur",
    "type": "nit"
  },
  {
    "name": "Dr. B. R. Ambedkar National Institute of Technology",
    "shortName": "NIT Jalandhar",
    "state": "Punjab",
    "city": "Jalandhar",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Meghalaya",
    "shortName": "NIT Meghalaya",
    "state": "Meghalaya",
    "city": "Shillong",
    "type": "nit"
  },
  {
    "name": "Maulana Azad National Institute of Technology",
    "shortName": "MANIT Bhopal",
    "state": "Madhya Pradesh",
    "city": "Bhopal",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Raipur",
    "shortName": "NIT Raipur",
    "state": "Chhattisgarh",
    "city": "Raipur",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Agartala",
    "shortName": "NIT Agartala",
    "state": "Tripura",
    "city": "Agartala",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Goa",
    "shortName": "NIT Goa",
    "state": "Goa",
    "city": "Ponda",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Jamshedpur",
    "shortName": "NIT Jamshedpur",
    "state": "Jharkhand",
    "city": "Jamshedpur",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Patna",
    "shortName": "NIT Patna",
    "state": "Bihar",
    "city": "Patna",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Hamirpur",
    "shortName": "NIT Hamirpur",
    "state": "Himachal Pradesh",
    "city": "Hamirpur",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Puducherry",
    "shortName": "NIT Puducherry",
    "state": "Puducherry",
    "city": "Karaikal",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Uttarakhand",
    "shortName": "NIT Uttarakhand",
    "state": "Uttarakhand",
    "city": "Srinagar",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Manipur",
    "shortName": "NIT Manipur",
    "state": "Manipur",
    "city": "Imphal",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Sikkim",
    "shortName": "NIT Sikkim",
    "state": "Sikkim",
    "city": "Ravangla",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Arunachal Pradesh",
    "shortName": "NIT AP",
    "state": "Arunachal Pradesh",
    "city": "Yupia",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Srinagar",
    "shortName": "NIT Srinagar",
    "state": "Jammu and Kashmir",
    "city": "Srinagar",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Mizoram",
    "shortName": "NIT Mizoram",
    "state": "Mizoram",
    "city": "Aizawl",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Nagaland",
    "shortName": "NIT Nagaland",
    "state": "Nagaland",
    "city": "Dimapur",
    "type": "nit"
  },
  {
    "name": "National Institute of Technology Andhra Pradesh",
    "shortName": "NIT Andhra Pradesh",
    "state": "Andhra Pradesh",
    "city": "Tadepalligudem",
    "type": "nit"
  },
  {
    "name": "Indian Institute of Engineering Science and Technology",
    "shortName": "IIEST Shibpur",
    "state": "West Bengal",
    "city": "Howrah",
    "type": "nit"
  },
  {
    "name": "International Institute of Information Technology Hyderabad",
    "shortName": "IIIT Hyderabad",
    "state": "Telangana",
    "city": "Hyderabad",
    "type": "iiit"
  },
  {
    "name": "International Institute of Information Technology Bangalore",
    "shortName": "IIIT Bangalore",
    "state": "Karnataka",
    "city": "Bangalore",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Allahabad",
    "shortName": "IIIT Allahabad",
    "state": "Uttar Pradesh",
    "city": "Prayagraj",
    "type": "iiit"
  },
  {
    "name": "ABV-Indian Institute of Information Technology and Management",
    "shortName": "IIITM Gwalior",
    "state": "Madhya Pradesh",
    "city": "Gwalior",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Design and Manufacturing Kancheepuram",
    "shortName": "IIITDM Kancheepuram",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Design and Manufacturing Jabalpur",
    "shortName": "IIITDM Jabalpur",
    "state": "Madhya Pradesh",
    "city": "Jabalpur",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Guwahati",
    "shortName": "IIIT Guwahati",
    "state": "Assam",
    "city": "Guwahati",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Sri City",
    "shortName": "IIIT Sri City",
    "state": "Andhra Pradesh",
    "city": "Sri City",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Kota",
    "shortName": "IIIT Kota",
    "state": "Rajasthan",
    "city": "Kota",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Vadodara",
    "shortName": "IIIT Vadodara",
    "state": "Gujarat",
    "city": "Vadodara",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Kalyani",
    "shortName": "IIIT Kalyani",
    "state": "West Bengal",
    "city": "Kalyani",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Lucknow",
    "shortName": "IIIT Lucknow",
    "state": "Uttar Pradesh",
    "city": "Lucknow",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Pune",
    "shortName": "IIIT Pune",
    "state": "Maharashtra",
    "city": "Pune",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Sonepat",
    "shortName": "IIIT Sonepat",
    "state": "Haryana",
    "city": "Sonepat",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Una",
    "shortName": "IIIT Una",
    "state": "Himachal Pradesh",
    "city": "Una",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Dharwad",
    "shortName": "IIIT Dharwad",
    "state": "Karnataka",
    "city": "Dharwad",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Kurnool",
    "shortName": "IIIT Kurnool",
    "state": "Andhra Pradesh",
    "city": "Kurnool",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Kottayam",
    "shortName": "IIIT Kottayam",
    "state": "Kerala",
    "city": "Kottayam",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Manipur",
    "shortName": "IIIT Manipur",
    "state": "Manipur",
    "city": "Imphal",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Ranchi",
    "shortName": "IIIT Ranchi",
    "state": "Jharkhand",
    "city": "Ranchi",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Surat",
    "shortName": "IIIT Surat",
    "state": "Gujarat",
    "city": "Surat",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Nagpur",
    "shortName": "IIIT Nagpur",
    "state": "Maharashtra",
    "city": "Nagpur",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Bhagalpur",
    "shortName": "IIIT Bhagalpur",
    "state": "Bihar",
    "city": "Bhagalpur",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Bhopal",
    "shortName": "IIIT Bhopal",
    "state": "Madhya Pradesh",
    "city": "Bhopal",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Agartala",
    "shortName": "IIIT Agartala",
    "state": "Tripura",
    "city": "Agartala",
    "type": "iiit"
  },
  {
    "name": "Indian Institute of Information Technology Raichur",
    "shortName": "IIIT Raichur",
    "state": "Karnataka",
    "city": "Raichur",
    "type": "iiit"
  },
  {
    "name": "Birla Institute of Technology and Science Pilani",
    "shortName": "BITS Pilani",
    "state": "Rajasthan",
    "city": "Pilani",
    "type": "other"
  },
  {
    "name": "Vellore Institute of Technology",
    "shortName": "VIT Vellore",
    "state": "Tamil Nadu",
    "city": "Vellore",
    "type": "other"
  },
  {
    "name": "Manipal Institute of Technology",
    "shortName": "MIT Manipal",
    "state": "Karnataka",
    "city": "Manipal",
    "type": "other"
  },
  {
    "name": "Jadavpur University",
    "shortName": "Jadavpur University",
    "state": "West Bengal",
    "city": "Kolkata",
    "type": "other"
  },
  {
    "name": "Delhi Technological University",
    "shortName": "DTU",
    "state": "Delhi",
    "city": "New Delhi",
    "type": "other"
  },
  {
    "name": "Netaji Subhas University of Technology",
    "shortName": "NSUT",
    "state": "Delhi",
    "city": "New Delhi",
    "type": "other"
  },
  {
    "name": "Indraprastha Institute of Information Technology",
    "shortName": "IIIT Delhi",
    "state": "Delhi",
    "city": "New Delhi",
    "type": "other"
  },
  {
    "name": "Thapar Institute of Engineering and Technology",
    "shortName": "TIET",
    "state": "Punjab",
    "city": "Patiala",
    "type": "other"
  },
  {
    "name": "SRM Institute of Science and Technology",
    "shortName": "SRM Chennai",
    "state": "Tamil Nadu",
    "city": "Chennai",
    "type": "other"
  },
  {
    "name": "Amrita Vishwa Vidyapeetham",
    "shortName": "Amrita",
    "state": "Tamil Nadu",
    "city": "Coimbatore",
    "type": "other"
  },
  {
    "name": "RV College of Engineering",
    "shortName": "RVCE",
    "state": "Karnataka",
    "city": "Bangalore",
    "type": "other"
  },
  {
    "name": "BMS College of Engineering",
    "shortName": "BMSCE",
    "state": "Karnataka",
    "city": "Bangalore",
    "type": "other"
  },
  {
    "name": "MS Ramaiah Institute of Technology",
    "shortName": "MSRIT",
    "state": "Karnataka",
    "city": "Bangalore",
    "type": "other"
  },
  {
    "name": "College of Engineering Pune",
    "shortName": "COEP",
    "state": "Maharashtra",
    "city": "Pune",
    "type": "other"
  },
  {
    "name": "Veermata Jijabai Technological Institute",
    "shortName": "VJTI",
    "state": "Maharashtra",
    "city": "Mumbai",
    "type": "other"
  },
  {
    "name": "Pune Institute of Computer Technology",
    "shortName": "PICT",
    "state": "Maharashtra",
    "city": "Pune",
    "type": "other"
  },
  {
    "name": "Sardar Patel Institute of Technology",
    "shortName": "SPIT",
    "state": "Maharashtra",
    "city": "Mumbai",
    "type": "other"
  },
  {
    "name": "Nirma University",
    "shortName": "Nirma",
    "state": "Gujarat",
    "city": "Ahmedabad",
    "type": "other"
  },
  {
    "name": "Punjab Engineering College",
    "shortName": "PEC",
    "state": "Chandigarh",
    "city": "Chandigarh",
    "type": "other"
  },
  {
    "name": "Harcourt Butler Technical University",
    "shortName": "HBTU",
    "state": "Uttar Pradesh",
    "city": "Kanpur",
    "type": "other"
  }
];

  const statesAndCities = [
    { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Amravati", "Jalgaon"] },
    { state: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"] },
    { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli"] },
    { state: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj"] },
    { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"] },
    { state: "Delhi", cities: ["New Delhi"] },
    { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"] },
    { state: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"] },
    { state: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"] },
    { state: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"] },
    { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam"] },
  ];
  const prefixes = ["Government Engineering College", "Institute of Technology", "College of Engineering", "Institute of Science and Technology", "Technical University", "Engineering College", "Institute of Research and Technology", "Global Institute of Engineering", "National Institute of Science", "City Engineering College"];

  let generatedCount = 500 - collegesData.length;
  for (let i = 0; i < generatedCount; i++) {
    const stateObj = statesAndCities[Math.floor(Math.random() * statesAndCities.length)];
    const city = stateObj.cities[Math.floor(Math.random() * stateObj.cities.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Create a unique name to avoid duplicates
    const name = `${prefix}, ${city} (Campus ${i + 1})`;
    const shortName = `${prefix.split(' ').map(w => w[0]).join('')} ${city}`;
    
    collegesData.push({
      name,
      shortName,
      state: stateObj.state,
      city,
      type: "state"
    });
  }

  const nirfMap: Record<string, number> = {
    "IIT Madras": 1,
    "IIT Delhi": 2,
    "IIT Bombay": 3,
    "IIT Kanpur": 4,
    "IIT Roorkee": 5,
    "IIT Kharagpur": 6,
    "IIT Guwahati": 7,
    "IIT Hyderabad": 8,
    "NIT Trichy": 9,
    "Jadavpur University": 10,
    "VIT Vellore": 11,
    "NIT Surathkal": 12,
    "IIT Indore": 14,
    "IIT BHU": 15,
    "NIT Rourkela": 16,
    "IIT ISM": 17,
    "IIT Gandhinagar": 18,
    "Amrita": 19,
    "TIET": 20,
    "NIT Warangal": 21,
    "IIT Ropar": 22,
    "NIT Calicut": 23,
    "IIT Jodhpur": 30,
    "IIT Mandi": 33,
    "MNIT Jaipur": 37,
    "NIT Silchar": 40,
    "VNIT Nagpur": 41,
    "NIT Durgapur": 43,
    "MNNIT Allahabad": 49,
    "IIIT Hyderabad": 55,
    "NIT Kurukshetra": 58,
    "NSUT": 60,
    "SVNIT Surat": 65,
    "IIIT Bangalore": 74,
    "IIIT Delhi": 75,
  };

  for (let i = 0; i < collegesData.length; i++) {
    const c = collegesData[i];
    
    // Assign random rank based on type
    let rank = 100;
    let baseRank = 500;
    
    if (nirfMap[c.shortName]) {
      rank = nirfMap[c.shortName];
      baseRank = 50 + (rank * 50); // e.g. IIT Madras opens at 100
    } else if (c.type === 'iit') { rank = 40 + i; baseRank = 1000 + i * 200; }
    else if (c.type === 'nit') { rank = 80 + i; baseRank = 2000 + i * 500; }
    else if (c.type === 'iiit') { rank = 100 + i; baseRank = 4000 + i * 800; }
    else if (c.type === 'state') { rank = 150 + (i % 300); baseRank = 15000 + ((i - 75) * 1200); }
    else { rank = 120 + i; baseRank = 3000 + i * 1000; }

    const college = await prisma.college.create({
      data: {
        name: c.name,
        shortName: c.shortName,
        websiteUrl: `https://www.${c.shortName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ac.in`,
        instituteType: c.type,
        state: c.state,
        city: c.city,
        nirfRank: rank,
        courses: {
          create: [
            {
              name: 'Computer Science and Engineering',
              branchCode: 'CSE',
              degreeType: 'B.Tech',
              totalIntake: 120,
              tuitionFee: 150000,
            },
            {
              name: 'Electronics and Communication Engineering',
              branchCode: 'ECE',
              degreeType: 'B.Tech',
              totalIntake: 120,
              tuitionFee: 150000,
            }
          ],
        },
      },
    });

    const courses = await prisma.course.findMany({
      where: { collegeId: college.id },
    });

    for (const course of courses) {
      const isCSE = course.branchCode === 'CSE';
      const factor = isCSE ? 1 : 1.5;
      await prisma.cutoff.create({
        data: {
          courseId: course.id,
          year: 2024,
          round: 1,
          category: 'GEN',
          quotaType: 'OS',
          openingRank: Math.floor(baseRank * factor),
          closingRank: Math.floor(baseRank * factor + 1000),
        },
      });
    }
  }
  console.log(`Seeded 100 colleges!`);

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
