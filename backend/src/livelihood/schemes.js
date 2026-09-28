/**
 * Schemes linked to a livelihood pathway (PM-AJAY GIA and related support).
 *
 * The rules use the same JSON shape as the existing Scheme model, and are
 * evaluated by the existing utils/rulesEngine.js — so the eligibility engine
 * built for Saksham is reused, not replaced. They live in code (not the DB) so
 * the recommender works without a database and every line stays reviewable.
 *
 * IMPORTANT: rules are simplified for the prototype. Amounts and cut-offs are
 * deliberately not quoted; state rules differ. The counsellor confirms
 * documents and current terms before anything is promised to a beneficiary.
 *
 * Facts available to the rules (built in recommend.js):
 *   category, age, gender, state, annualIncome,
 *   wantsSelfEmployment (bool), isArtisan (bool), isWoman (bool)
 */

const t = (en, hi) => ({ en, hi });

// Trades that sit inside the PM Vishwakarma list of traditional crafts
// (carpenter, potter, cobbler, mason, tailor, basket/mat maker ...).
const ARTISAN_TRADES = ['handicraft', 'leather', 'tailoring', 'construction'];

const SCHEMES = [
  {
    id: 'pm-ajay-gia',
    name: t('PM-AJAY: skill training and livelihood support (GIA)', 'पीएम-अजय: कौशल प्रशिक्षण और आजीविका सहायता (जीआईए)'),
    benefit: t(
      'Free skill training and livelihood or enterprise support for Scheduled Caste families, run through the State or UT.',
      'अनुसूचित जाति परिवारों के लिए निःशुल्क कौशल प्रशिक्षण और आजीविका या उद्यम सहायता, राज्य/केंद्रशासित प्रदेश के माध्यम से।'
    ),
    appliesTo: 'any',
    url: 'https://socialjustice.gov.in',
    eligibilityRules: { all: [{ fact: 'category', operator: 'equal', value: 'sc' }, { fact: 'age', operator: 'greaterThanInclusive', value: 15 }] },
    applicableStates: [],
  },
  {
    id: 'nsfdc-loan',
    name: t('NSFDC concessional loan', 'एनएसएफडीसी रियायती ऋण'),
    benefit: t(
      'Low-interest loans for Scheduled Caste families starting a small business, through the State channelising agency.',
      'छोटा काम शुरू करने वाले अनुसूचित जाति परिवारों के लिए कम ब्याज पर ऋण, राज्य की चैनलाइज़िंग एजेंसी के माध्यम से।'
    ),
    appliesTo: 'self',
    url: 'https://nsfdc.nic.in',
    eligibilityRules: {
      all: [
        { fact: 'category', operator: 'equal', value: 'sc' },
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
        { fact: 'wantsSelfEmployment', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
  {
    id: 'pm-vishwakarma',
    name: t('PM Vishwakarma', 'पीएम विश्वकर्मा'),
    benefit: t(
      'For traditional craft workers such as carpenters, potters, cobblers, masons and tailors: recognition, training with a stipend, a toolkit incentive and low-cost credit.',
      'बढ़ई, कुम्हार, मोची, राजमिस्त्री और दर्ज़ी जैसे पारंपरिक कारीगरों के लिए: पहचान, वज़ीफ़े के साथ प्रशिक्षण, औज़ार सहायता और सस्ता ऋण।'
    ),
    appliesTo: 'any',
    onlyForTrades: ARTISAN_TRADES,
    url: 'https://pmvishwakarma.gov.in',
    eligibilityRules: {
      all: [
        { fact: 'isArtisan', operator: 'equal', value: true },
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
      ],
    },
    applicableStates: [],
  },
  {
    id: 'pmegp',
    name: t('PMEGP micro-enterprise subsidy', 'पीएमईजीपी सूक्ष्म उद्यम अनुदान'),
    benefit: t(
      'Bank loan with a government subsidy for setting up a small manufacturing or service unit; SC applicants get a higher subsidy share.',
      'छोटी विनिर्माण या सेवा इकाई शुरू करने के लिए बैंक ऋण के साथ सरकारी अनुदान; अनुसूचित जाति के आवेदकों को अधिक अनुदान मिलता है।'
    ),
    appliesTo: 'self',
    url: 'https://www.kviconline.gov.in/pmegpeportal',
    eligibilityRules: {
      all: [
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
        { fact: 'wantsSelfEmployment', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
  {
    id: 'mudra',
    name: t('MUDRA loan', 'मुद्रा ऋण'),
    benefit: t(
      'Collateral-free small loans for a shop, workshop or service business.',
      'दुकान, वर्कशॉप या सेवा के काम के लिए बिना गारंटी के छोटा ऋण।'
    ),
    appliesTo: 'self',
    url: 'https://www.mudra.org.in',
    eligibilityRules: {
      all: [
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
        { fact: 'wantsSelfEmployment', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
  {
    id: 'standup-india',
    name: t('Stand-Up India', 'स्टैंड-अप इंडिया'),
    benefit: t(
      'Bank loans for a first-time enterprise owned by a Scheduled Caste, Scheduled Tribe or woman entrepreneur.',
      'अनुसूचित जाति, अनुसूचित जनजाति या महिला उद्यमी के पहले उद्यम के लिए बैंक ऋण।'
    ),
    appliesTo: 'self',
    url: 'https://www.standupmitra.in',
    eligibilityRules: {
      all: [
        { fact: 'category', operator: 'equal', value: 'sc' },
        { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
        { fact: 'wantsSelfEmployment', operator: 'equal', value: true },
      ],
    },
    applicableStates: [],
  },
  {
    id: 'day-nrlm',
    name: t('DAY-NRLM self-help group', 'दीनदयाल अंत्योदय योजना-एनआरएलएम स्वयं सहायता समूह'),
    benefit: t(
      'Join a women’s self-help group for savings, a revolving fund and bank credit for a village-level livelihood.',
      'बचत, रिवॉल्विंग फ़ंड और गाँव स्तर के काम के लिए बैंक ऋण हेतु महिला स्वयं सहायता समूह से जुड़ना।'
    ),
    appliesTo: 'any',
    url: 'https://aajeevika.gov.in',
    eligibilityRules: { all: [{ fact: 'isWoman', operator: 'equal', value: true }] },
    applicableStates: [],
  },
];

// Documents a counsellor will ask for, whichever scheme is chosen.
const COMMON_DOCUMENTS = [
  t('Caste certificate', 'जाति प्रमाण पत्र'),
  t('Aadhaar card', 'आधार कार्ड'),
  t('Bank passbook', 'बैंक पासबुक'),
  t('Passport-size photo', 'पासपोर्ट साइज़ फ़ोटो'),
];

module.exports = { SCHEMES, ARTISAN_TRADES, COMMON_DOCUMENTS };
