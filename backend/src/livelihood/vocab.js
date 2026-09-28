/**
 * Shared vocabulary for the voice livelihood assistant (SIH26097).
 *
 * Everything language-specific lives here so that adding a language means
 * adding keywords + prompts in this one file (the engine itself is language
 * agnostic). Right now: English (en, incl. Romanised Hindi) and Hindi (hi).
 *
 * Keywords are matched as *prefixes of words* for Latin script (so "weav"
 * matches "weaver", "weaving") and as substrings for Devanagari.
 */

// ---------- Education ----------
const EDU_RANK = {
  none: 0,
  primary: 1,
  class8: 2,
  class10: 3,
  iti: 4,
  class12: 4,
  diploma: 5,
  graduate: 6,
};

const EDU_LABEL = {
  none: { en: 'No formal schooling', hi: 'औपचारिक स्कूली शिक्षा नहीं' },
  primary: { en: 'Primary school', hi: 'प्राथमिक शिक्षा' },
  class8: { en: 'Class 8', hi: '8वीं कक्षा' },
  class10: { en: 'Class 10', hi: '10वीं कक्षा' },
  class12: { en: 'Class 12', hi: '12वीं कक्षा' },
  iti: { en: 'ITI', hi: 'आईटीआई' },
  diploma: { en: 'Diploma', hi: 'डिप्लोमा' },
  graduate: { en: 'Graduate', hi: 'स्नातक' },
};

// ---------- Trades / livelihood activities ----------
// key -> label + keywords. Courses reference these keys in `trades`.
const TRADES = {
  farming: {
    en: 'farming', hi: 'खेती',
    kw: {
      en: ['farm', 'kheti', 'agricultur', 'crop', 'cultivat', 'kisan', 'harvest'],
      hi: ['खेती', 'किसान', 'खेत', 'फसल', 'कृषि'],
    },
  },
  dairy: {
    en: 'dairy and livestock', hi: 'पशुपालन और डेयरी',
    kw: {
      en: ['dairy', 'cow', 'buffalo', 'goat', 'livestock', 'milk', 'poultry', 'cattle', 'pashupalan'],
      hi: ['पशुपालन', 'दूध', 'गाय', 'भैंस', 'बकरी', 'मुर्गी', 'डेयरी'],
    },
  },
  weaving: {
    en: 'weaving and handloom', hi: 'बुनाई और हथकरघा',
    kw: {
      en: ['weav', 'handloom', 'loom', 'charkha', 'spinning'],
      hi: ['बुनकर', 'बुनाई', 'हथकरघा', 'करघा', 'चरखा'],
    },
  },
  tailoring: {
    en: 'tailoring and stitching', hi: 'सिलाई',
    kw: {
      en: ['tailor', 'stitch', 'sewing', 'sew', 'silai', 'garment', 'embroider'],
      hi: ['सिलाई', 'दर्जी', 'कढ़ाई'],
    },
  },
  construction: {
    en: 'construction and masonry', hi: 'निर्माण और राजमिस्त्री का काम',
    kw: {
      en: ['mason', 'construct', 'building', 'bricklay', 'plaster', 'tile', 'painter', 'painting', 'mistri'],
      hi: ['राजमिस्त्री', 'मिस्त्री', 'निर्माण', 'पेंटर', 'रंगाई', 'प्लास्टर', 'टाइल'],
    },
  },
  electrical: {
    en: 'electrical work', hi: 'बिजली का काम',
    kw: {
      en: ['electric', 'wiring', 'wireman', 'inverter'],
      hi: ['बिजली', 'इलेक्ट्रीशियन', 'वायरिंग', 'इन्वर्टर'],
    },
  },
  solar: {
    en: 'solar energy', hi: 'सोलर ऊर्जा',
    kw: { en: ['solar'], hi: ['सोलर', 'सौर'] },
  },
  plumbing: {
    en: 'plumbing', hi: 'प्लंबिंग',
    kw: { en: ['plumb', 'pipe', 'sanitary'], hi: ['प्लंबर', 'प्लंबिंग', 'पाइप', 'नल'] },
  },
  mechanic: {
    en: 'vehicle and machine repair', hi: 'गाड़ी और मशीन की मरम्मत',
    kw: {
      en: ['mechanic', 'garage', 'bike repair', 'motorcycle', 'two wheeler', 'scooter', 'welding', 'welder', 'fitter'],
      hi: ['मैकेनिक', 'गैरेज', 'मरम्मत', 'वेल्डिंग', 'वेल्डर', 'फिटर', 'मोटरसाइकिल', 'बाइक'],
    },
  },
  driving: {
    en: 'driving', hi: 'ड्राइविंग',
    kw: {
      en: ['driv', 'taxi', 'rickshaw', 'truck', 'tempo', 'chauffeur'],
      hi: ['ड्राइवर', 'ड्राइविंग', 'गाड़ी चला', 'टैक्सी', 'रिक्शा', 'ट्रक'],
    },
  },
  beauty: {
    en: 'beauty and wellness', hi: 'ब्यूटी और वेलनेस',
    kw: {
      en: ['beauty', 'parlour', 'parlor', 'salon', 'makeup', 'mehndi', 'hair'],
      hi: ['ब्यूटी', 'पार्लर', 'सैलून', 'मेहंदी', 'मेकअप'],
    },
  },
  cooking: {
    en: 'cooking and food', hi: 'खाना बनाना और फूड सर्विस',
    kw: {
      en: ['cook', 'food', 'catering', 'tiffin', 'bakery', 'baking', 'halwai', 'canteen', 'kitchen'],
      hi: ['खाना', 'रसोई', 'हलवाई', 'कैटरिंग', 'टिफिन', 'बेकरी', 'नाश्ता'],
    },
  },
  handicraft: {
    en: 'handicrafts, pottery and bamboo work', hi: 'हस्तशिल्प, मिट्टी और बांस का काम',
    kw: {
      en: ['handicraft', 'pottery', 'potter', 'clay', 'bamboo', 'cane', 'craft', 'carpent', 'woodwork', 'wood work'],
      hi: ['हस्तशिल्प', 'कुम्हार', 'मिट्टी', 'बांस', 'बढ़ई', 'लकड़ी', 'कारीगर'],
    },
  },
  leather: {
    en: 'leather and footwear', hi: 'चमड़ा और जूते-चप्पल',
    kw: {
      en: ['leather', 'cobbler', 'shoe', 'footwear', 'chappal'],
      hi: ['चमड़ा', 'चमड़े', 'जूते', 'जूता', 'मोची', 'चप्पल'],
    },
  },
  retail: {
    en: 'shop and retail', hi: 'दुकान और खुदरा बिक्री',
    kw: {
      en: ['shop', 'retail', 'vendor', 'store', 'hawker', 'sales', 'selling', 'kirana'],
      hi: ['दुकान', 'दुकानदार', 'बेचना', 'बिक्री', 'किराना', 'फेरी', 'ठेला'],
    },
  },
  computer: {
    en: 'computer and office work', hi: 'कंप्यूटर और ऑफिस का काम',
    kw: {
      en: ['computer', 'laptop', 'typing', 'data entry', 'phone repair', 'mobile repair', 'office work', 'tally', 'excel'],
      hi: ['कंप्यूटर', 'कम्प्यूटर', 'लैपटॉप', 'टाइपिंग', 'डेटा एंट्री', 'ऑफिस'],
    },
  },
  caregiving: {
    en: 'healthcare and caregiving', hi: 'स्वास्थ्य सेवा और देखभाल',
    kw: {
      en: ['nurs', 'caregiv', 'health worker', 'asha', 'anganwadi', 'patient', 'elder care', 'hospital', 'medical'],
      hi: ['नर्स', 'देखभाल', 'आशा', 'आंगनवाड़ी', 'मरीज', 'अस्पताल', 'स्वास्थ्य'],
    },
  },
  housekeeping: {
    en: 'housekeeping and cleaning', hi: 'हाउसकीपिंग और सफ़ाई',
    kw: {
      en: ['housekeep', 'domestic', 'cleaning', 'maid', 'sweeper', 'janitor', 'laundry'],
      hi: ['घरेलू', 'सफाई', 'हाउसकीपिंग', 'झाड़ू', 'कामवाली', 'धुलाई'],
    },
  },
  labour: {
    en: 'daily-wage labour', hi: 'दिहाड़ी मज़दूरी',
    kw: {
      en: ['labour', 'labor', 'daily wage', 'wage work', 'mazdoor', 'coolie', 'mgnrega', 'nrega'],
      hi: ['मजदूर', 'मजदूरी', 'दिहाड़ी', 'मनरेगा'],
    },
  },
};

// ---------- States ----------
// `name` must match the state names used by the scheme rules (see Eligibility.jsx).
const STATES = [
  { name: 'Andhra Pradesh', kw: ['andhra', 'आंध्र'] },
  { name: 'Assam', kw: ['assam', 'असम'] },
  { name: 'Bihar', kw: ['bihar', 'बिहार'] },
  { name: 'Chhattisgarh', kw: ['chhattisgarh', 'chattisgarh', 'छत्तीसगढ़'] },
  { name: 'Delhi', kw: ['delhi', 'दिल्ली'] },
  { name: 'Gujarat', kw: ['gujarat', 'गुजरात'] },
  { name: 'Haryana', kw: ['haryana', 'हरियाणा'] },
  { name: 'Himachal Pradesh', kw: ['himachal', 'हिमाचल'] },
  { name: 'Jharkhand', kw: ['jharkhand', 'झारखंड'] },
  { name: 'Karnataka', kw: ['karnataka', 'कर्नाटक'] },
  { name: 'Kerala', kw: ['kerala', 'केरल'] },
  { name: 'Madhya Pradesh', kw: ['madhya pradesh', 'मध्य प्रदेश', 'मध्यप्रदेश'] },
  { name: 'Maharashtra', kw: ['maharashtra', 'महाराष्ट्र'] },
  { name: 'Odisha', kw: ['odisha', 'orissa', 'ओडिशा', 'उड़ीसा'] },
  { name: 'Punjab', kw: ['punjab', 'पंजाब'] },
  { name: 'Rajasthan', kw: ['rajasthan', 'राजस्थान'] },
  { name: 'Tamil Nadu', kw: ['tamil nadu', 'tamilnadu', 'तमिलनाडु', 'तमिल नाडु'] },
  { name: 'Telangana', kw: ['telangana', 'तेलंगाना'] },
  { name: 'Uttar Pradesh', kw: ['uttar pradesh', 'उत्तर प्रदेश', 'उत्तरप्रदेश'] },
  { name: 'Uttarakhand', kw: ['uttarakhand', 'उत्तराखंड'] },
  { name: 'West Bengal', kw: ['west bengal', 'bengal', 'पश्चिम बंगाल', 'बंगाल'] },
];

// ---------- Interview script ----------
// Covers the 7 topics named in the SIH26097 brief + state/age + local economy.
const QUESTIONS = [
  {
    id: 'where',
    fields: ['state', 'age'],
    prompt: {
      en: 'Which state do you live in, and how old are you?',
      hi: 'आप किस राज्य में रहते हैं, और आपकी उम्र कितनी है?',
    },
  },
  {
    id: 'education',
    fields: ['education'],
    prompt: {
      en: 'How far did you study in school or college?',
      hi: 'आपने स्कूल या कॉलेज में कहाँ तक पढ़ाई की है?',
    },
  },
  {
    id: 'family',
    fields: ['familyOccupation'],
    prompt: {
      en: 'What work does your family traditionally do?',
      hi: 'आपके परिवार में पारंपरिक रूप से कौन-सा काम होता है?',
    },
  },
  {
    id: 'current',
    fields: ['currentActivity'],
    prompt: {
      en: 'What work do you do now to earn money?',
      hi: 'आप अभी कमाई के लिए क्या काम करते हैं?',
    },
  },
  {
    id: 'interests',
    fields: ['interests'],
    prompt: {
      en: 'What kind of work or skill would you like to learn?',
      hi: 'आप कौन-सा काम या हुनर सीखना चाहेंगे?',
    },
  },
  {
    id: 'mobility',
    fields: ['mobility'],
    prompt: {
      en: 'Can you travel or stay away from home for training, or do you need something close to home? Please also tell us if you have any health or physical difficulty.',
      hi: 'क्या आप ट्रेनिंग के लिए बाहर जा सकते हैं, या घर के पास ही चाहिए? कोई सेहत या शारीरिक परेशानी हो तो वह भी बताइए।',
    },
  },
  {
    id: 'preference',
    fields: ['employmentPreference'],
    prompt: {
      en: 'Would you prefer a job with a salary, or your own small business?',
      hi: 'आप नौकरी करना पसंद करेंगे, या अपना छोटा काम शुरू करना?',
    },
  },
  {
    id: 'local',
    fields: ['localWork'],
    prompt: {
      en: 'What kind of work do people around you do to earn, or what work is easy to find near you?',
      hi: 'आपके आसपास लोग कमाई के लिए कौन-सा काम करते हैं, या कौन-सा काम आसानी से मिल जाता है?',
    },
  },
];

// Used when a multi-field question is only partly answered.
const FIELD_PROMPTS = {
  state: { en: 'Which state do you live in?', hi: 'आप किस राज्य में रहते हैं?' },
  age: { en: 'How old are you?', hi: 'आपकी उम्र कितनी है?' },
};

// ---------- Keyword lists for scalar answers ----------
const KW = {
  skip: {
    en: ['skip', 'dont know', 'do not know', 'no idea', 'not sure', 'pata nahi', 'nahi pata'],
    hi: ['पता नहीं', 'नहीं पता', 'नहीं मालूम', 'मालूम नहीं', 'स्किप', 'छोड़ो'],
  },
  none: {
    en: ['nothing', 'no work', 'jobless', 'unemployed', 'not working', 'no job', 'bekar', 'kuch nahi', 'koi kaam nahi'],
    hi: ['कुछ नहीं', 'बेरोजगार', 'काम नहीं', 'खाली', 'बेकार'],
  },
  edu: {
    none: {
      en: ['never studied', 'not studied', 'no school', 'never went to school', 'illiterate', 'uneducated', 'anpadh'],
      hi: ['अनपढ़', 'पढ़ाई नहीं', 'स्कूल नहीं', 'पढ़ा नहीं', 'पढ़ी नहीं'],
    },
    iti: { en: ['iti'], hi: ['आईटीआई'] },
    diploma: { en: ['diploma', 'polytechnic'], hi: ['डिप्लोमा', 'पॉलीटेक्निक'] },
    graduate: {
      en: ['graduat', 'degree', 'bachelor', 'btech', 'b tech', 'bsc', 'b sc', 'bcom', 'b com', 'college pass'],
      hi: ['स्नातक', 'ग्रेजुएट', 'डिग्री', 'बीए', 'बीएससी', 'बीकॉम'],
    },
    primary: { en: ['primary'], hi: ['प्राथमिक'] },
  },
  // spelled-out class words -> class number
  eduWords: [
    ['twelfth', 12], ['tenth', 10], ['eighth', 8], ['fifth', 5],
    ['बारहवीं', 12], ['दसवीं', 10], ['आठवीं', 8], ['पांचवीं', 5],
  ],
  local: {
    en: [
      'near home', 'near my home', 'close to home', 'near me', 'cant travel', 'cannot travel', 'cant go',
      'cannot go', 'not able to travel', 'stay home', 'stay here', 'at home', 'in my village', 'no travel',
    ],
    hi: ['घर के पास', 'घर पर', 'गांव में', 'यहीं', 'नहीं जा सकता', 'नहीं जा सकती', 'बाहर नहीं', 'दूर नहीं'],
  },
  district: {
    en: ['district', 'nearby town', 'same district'],
    hi: ['जिले', 'जिला', 'ज़िले'],
  },
  anywhere: {
    en: ['anywhere', 'any city', 'any place', 'can travel', 'can go', 'can relocate', 'willing to travel', 'hostel'],
    hi: ['कहीं भी', 'शहर', 'जा सकता हूं', 'जा सकती हूं', 'बाहर जा', 'हॉस्टल'],
  },
  physical: {
    en: ['disab', 'handicap', 'injur', 'back pain', 'cannot lift', 'cant lift', 'weak', 'physical problem', 'wheelchair'],
    hi: ['विकलांग', 'दिव्यांग', 'चोट', 'कमजोर', 'कमर दर्द', 'अपंग'],
  },
  physicalNeg: {
    en: ['no disab', 'not disab', 'no problem', 'no physical', 'no health'],
    hi: ['कोई परेशानी नहीं', 'कोई दिक्कत नहीं', 'कोई समस्या नहीं'],
  },
  self: {
    en: ['own business', 'my own', 'self employ', 'self-employ', 'business', 'start a shop', 'open a shop', 'khud ka'],
    hi: ['अपना काम', 'अपना व्यवसाय', 'अपना बिज़नेस', 'खुद का', 'स्वरोजगार', 'दुकान खोल', 'बिजनेस', 'व्यवसाय'],
  },
  wage: {
    en: ['job', 'salary', 'company', 'employ', 'wage', 'naukri', 'factory'],
    hi: ['नौकरी', 'सैलरी', 'तनख्वाह', 'कंपनी', 'फैक्ट्री'],
  },
  either: {
    en: ['either', 'both', 'anything', 'any work'],
    hi: ['कोई भी', 'दोनों', 'कुछ भी'],
  },
};

module.exports = {
  EDU_RANK,
  EDU_LABEL,
  TRADES,
  STATES,
  QUESTIONS,
  FIELD_PROMPTS,
  KW,
};
