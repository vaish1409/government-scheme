// Sample real-world schemes with simplified (illustrative) eligibility rules.
// Always verify the actual official criteria before using this in production —
// these are simplified for demo purposes.

const schemes = [
  {
    name: 'PM Kisan Samman Nidhi',
    slug: 'pm-kisan',
    category: 'agriculture',
    description: 'Income support of ₹6,000/year for small and marginal farmer families.',
    benefits: '₹2,000 every 4 months directly to bank account (₹6,000/year total).',
    applyUrl: 'https://pmkisan.gov.in',
    documentsRequired: ['Aadhaar Card', 'Land ownership papers', 'Bank passbook'],
    eligibilityRules: {
      all: [{ fact: 'occupation', operator: 'equal', value: 'farmer' }],
    },
    applicableStates: [],
  },
  {
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    slug: 'pmmvy',
    category: 'women',
    description: 'Cash incentive for pregnant and lactating mothers for their first live birth.',
    benefits: '₹5,000 in installments for the first child.',
    applyUrl: 'https://pmmvy.wcd.gov.in',
    documentsRequired: ['Aadhaar Card', 'Bank passbook', 'MCP card (Mother and Child Protection card)'],
    eligibilityRules: {
      all: [
        { fact: 'gender', operator: 'equal', value: 'female' },
        { fact: 'isPregnantOrLactating', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
  {
    name: 'Ayushman Bharat – PM-JAY',
    slug: 'ayushman-bharat',
    category: 'health',
    description: 'Health insurance cover of ₹5 lakh per family per year for secondary/tertiary care.',
    benefits: 'Cashless hospitalization up to ₹5,00,000 per family per year.',
    applyUrl: 'https://pmjay.gov.in',
    documentsRequired: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
    eligibilityRules: {
      all: [{ fact: 'annualIncome', operator: 'lessThanInclusive', value: 250000 }],
    },
    applicableStates: [],
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    slug: 'sukanya-samriddhi',
    category: 'finance',
    description: 'Savings scheme for the girl child with attractive interest rates and tax benefits.',
    benefits: 'High interest rate savings account, maturity at age 21 of the girl child.',
    applyUrl: 'https://www.india.gov.in/sukanya-samriddhi-yojana',
    documentsRequired: ["Girl child's birth certificate", "Parent/guardian ID proof", 'Address proof'],
    eligibilityRules: {
      all: [{ fact: 'gender', operator: 'equal', value: 'female' }],
    },
    applicableStates: [],
  },
  {
    name: 'PM Jan Dhan Yojana',
    slug: 'jan-dhan',
    category: 'finance',
    description: 'Zero-balance bank account scheme aimed at financial inclusion.',
    benefits: 'Free bank account, RuPay debit card, accident insurance of ₹2 lakh, overdraft facility.',
    applyUrl: 'https://pmjdy.gov.in',
    documentsRequired: ['Aadhaar Card', 'Passport-size photo'],
    eligibilityRules: {
      all: [{ fact: 'hasBankAccount', operator: 'equal', value: false }],
    },
    applicableStates: [],
  },
  {
    name: 'National Scholarship for OBC/SC/ST Students',
    slug: 'national-scholarship',
    category: 'education',
    description: 'Financial assistance for students from reserved categories to pursue education.',
    benefits: 'Tuition fee reimbursement and maintenance allowance.',
    applyUrl: 'https://scholarships.gov.in',
    documentsRequired: ['Caste certificate', 'Income certificate', 'Previous year mark sheet'],
    eligibilityRules: {
      all: [
        { fact: 'category', operator: 'in', value: ['obc', 'sc', 'st'] },
        { fact: 'annualIncome', operator: 'lessThanInclusive', value: 250000 },
      ],
    },
    applicableStates: [],
  },
  {
    name: 'Atal Pension Yojana',
    slug: 'atal-pension-yojana',
    category: 'finance',
    description: 'Guaranteed pension scheme for workers in the unorganised sector.',
    benefits: 'Fixed monthly pension of ₹1,000–₹5,000 after age 60.',
    applyUrl: 'https://npscra.nsdl.co.in/scheme-details.php',
    documentsRequired: ['Aadhaar Card', 'Bank account'],
    eligibilityRules: {
      all: [
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
        { fact: 'age', operator: 'lessThanInclusive', value: 40 },
        { fact: 'hasBankAccount', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
];

module.exports = schemes;
