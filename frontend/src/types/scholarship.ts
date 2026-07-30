export interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  category: string | null;
  type: string;
  
  amountMax: number | null;
  incomeLimit: number | null;
  
  eligibilityCriteria: string | null;
  academicRequirements: any | null;
  applicableCourses: string[];
  stateEligibility: string[];
  minorityEligibility: boolean;
  casteEligibility: string[];
  genderEligibility: string | null;
  pwdEligibility: boolean;
  
  applicationMode: string | null;
  applicationUrl: string | null;
  applicationStart: string | null;
  deadline: string | null;
  status: string;
  
  requiredDocuments: string[];
  renewalInformation: string | null;
  helplineNumber: string | null;
  contactEmail: string | null;
  
  isActive: boolean;
}

export interface ScholarshipMatch extends Scholarship {
  matchScore: number;
  reasons: any;
}
