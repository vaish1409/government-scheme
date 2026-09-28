/**
 * Sample NSQF-aligned course catalogue (PROTOTYPE DATA).
 *
 * Titles, levels, entry education and durations are illustrative and follow
 * the general shape of Sector Skill Council qualification packs. Before a real
 * rollout, replace this file with a sync from the Skill India Digital Hub /
 * NSDC qualification-pack data. The recommender does not care where the rows
 * come from as long as they keep this shape.
 *
 * `trades` uses the same keys as TRADES in vocab.js.
 */

const t = (en, hi) => ({ en, hi });

const SSC = {
  agri: 'Agriculture Skill Council of India',
  textile: 'Textile Sector Skill Council',
  apparel: 'Apparel, Made-ups & Home Furnishing Sector Skill Council',
  construction: 'Construction Skill Development Council of India',
  electronics: 'Electronics Sector Skill Council of India',
  power: 'Power Sector Skill Council',
  green: 'Skill Council for Green Jobs',
  plumbing: 'Indian Plumbing Skill Council',
  auto: 'Automotive Skills Development Council',
  capital: 'Capital Goods Skill Council',
  beauty: 'Beauty & Wellness Sector Skill Council',
  hospitality: 'Tourism & Hospitality Skill Council',
  handicraft: 'Handicrafts & Carpet Sector Skill Council',
  furniture: 'Furniture & Fittings Skill Council',
  leather: 'Leather Sector Skill Council',
  retail: "Retailers Association's Skill Council of India",
  itites: 'IT-ITeS Sector Skill Council (NASSCOM)',
  telecom: 'Telecom Sector Skill Council',
  health: 'Healthcare Sector Skill Council',
  domestic: 'Domestic Workers Sector Skill Council',
};

// Where the training usually runs (used only for display).
const CENTRE = {
  kvk: t('Krishi Vigyan Kendra', 'कृषि विज्ञान केंद्र'),
  rseti: t('RSETI (rural self-employment training institute)', 'आरसेटी (ग्रामीण स्वरोजगार प्रशिक्षण संस्थान)'),
  iti: t('ITI', 'आईटीआई'),
  pmkk: t('PM Kaushal Kendra / NSDC training partner', 'पीएम कौशल केंद्र / एनएसडीसी प्रशिक्षण भागीदार'),
  wsc: t("Weavers' Service Centre", 'बुनकर सेवा केंद्र'),
  csc: t('Common Service Centre / NIELIT centre', 'कॉमन सर्विस सेंटर / नील्ट केंद्र'),
  hospital: t('Hospital or NSDC health training partner', 'अस्पताल या एनएसडीसी स्वास्थ्य प्रशिक्षण भागीदार'),
};

const S = t; // a skill is also a { en, hi } pair

const COURSES = [
  // ---------- farming ----------
  {
    id: 'AGR-01', ssc: SSC.agri, centre: CENTRE.kvk, nsqf: 3, minEdu: 'none', weeks: 8,
    trades: ['farming'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: 'AGR-02',
    title: t('Crop cultivation: good farm practices', 'फसल उत्पादन: अच्छी खेती के तरीके'),
    skills: [S('Seed and soil treatment', 'बीज और मिट्टी का उपचार'), S('Safe use of fertiliser and pesticide', 'खाद और कीटनाशक का सुरक्षित उपयोग'), S('Record keeping and selling at mandi', 'हिसाब रखना और मंडी में बिक्री')],
    roles: t('Farm supervisor, agri input shop helper', 'फार्म सुपरवाइज़र, कृषि दुकान सहायक'),
    enterprise: t('Grow and sell vegetables or seedlings', 'सब्ज़ी या पौध उगाकर बेचना'),
  },
  {
    id: 'AGR-02', ssc: SSC.agri, centre: CENTRE.kvk, nsqf: 4, minEdu: 'class8', weeks: 10,
    trades: ['farming'], pathways: ['self', 'wage'], physical: 'medium', residential: false, next: null,
    title: t('Organic farming and vermicompost entrepreneur', 'जैविक खेती और वर्मीकम्पोस्ट उद्यमी'),
    skills: [S('Making vermicompost', 'वर्मीकम्पोस्ट बनाना'), S('Organic pest control', 'जैविक कीट नियंत्रण'), S('Pricing and direct selling', 'भाव तय करना और सीधे बिक्री')],
    roles: t('Organic farm technician', 'जैविक फार्म तकनीशियन'),
    enterprise: t('Sell vermicompost and organic produce', 'वर्मीकम्पोस्ट और जैविक उपज बेचना'),
  },
  // ---------- dairy ----------
  {
    id: 'DAI-01', ssc: SSC.agri, centre: CENTRE.kvk, nsqf: 3, minEdu: 'none', weeks: 6,
    trades: ['dairy'], pathways: ['self', 'wage'], physical: 'medium', residential: false, next: null,
    title: t('Dairy farmer and small dairy entrepreneur', 'डेयरी किसान और छोटा डेयरी उद्यमी'),
    skills: [S('Feeding and animal health basics', 'चारा और पशु स्वास्थ्य की बुनियादी बातें'), S('Clean milk handling', 'साफ़ दूध निकालना और रखना'), S('Dairy accounts and loans', 'डेयरी का हिसाब और ऋण')],
    roles: t('Dairy cooperative collection assistant', 'डेयरी सहकारी संग्रह सहायक'),
    enterprise: t('Run a small dairy or poultry unit', 'छोटी डेयरी या मुर्गीपालन इकाई चलाना'),
  },
  // ---------- weaving ----------
  {
    id: 'WEA-01', ssc: SSC.textile, centre: CENTRE.wsc, nsqf: 3, minEdu: 'none', weeks: 12,
    trades: ['weaving'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Handloom weaver', 'हथकरघा बुनकर'),
    skills: [S('Warping and loom setup', 'ताना और करघा तैयार करना'), S('New patterns and quality checks', 'नए डिज़ाइन और गुणवत्ता जाँच'), S('Finding buyers and fair price', 'खरीदार ढूँढना और सही दाम')],
    roles: t('Weaver in a cooperative or mill', 'सहकारी समिति या मिल में बुनकर'),
    enterprise: t('Weave and sell through a group or online', 'समूह या ऑनलाइन बेचने के लिए बुनाई'),
  },
  // ---------- tailoring ----------
  {
    id: 'TAI-01', ssc: SSC.apparel, centre: CENTRE.rseti, nsqf: 3, minEdu: 'primary', weeks: 10,
    trades: ['tailoring'], pathways: ['wage', 'self'], physical: 'low', residential: false, next: 'TAI-02',
    title: t('Sewing machine operator', 'सिलाई मशीन ऑपरेटर'),
    skills: [S('Machine stitching and finishing', 'मशीन से सिलाई और फिनिशिंग'), S('Reading a garment pattern', 'कपड़े का पैटर्न पढ़ना'), S('Quality and speed', 'गुणवत्ता और रफ़्तार')],
    roles: t('Operator in a garment unit', 'गारमेंट यूनिट में ऑपरेटर'),
    enterprise: t('Take stitching orders from home', 'घर से सिलाई के ऑर्डर लेना'),
  },
  {
    id: 'TAI-02', ssc: SSC.apparel, centre: CENTRE.rseti, nsqf: 4, minEdu: 'class8', weeks: 12,
    trades: ['tailoring'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Tailor and dressmaker', 'दर्ज़ी और ड्रेसमेकर'),
    skills: [S('Measuring and cutting', 'नाप लेना और कटाई'), S('Blouse, kurta and school uniform', 'ब्लाउज़, कुर्ता और स्कूल यूनिफ़ॉर्म'), S('Pricing and customer handling', 'दाम तय करना और ग्राहक से बात')],
    roles: t('Cutting master, boutique tailor', 'कटिंग मास्टर, बुटीक दर्ज़ी'),
    enterprise: t('Open a tailoring shop', 'सिलाई की दुकान खोलना'),
  },
  // ---------- construction ----------
  {
    id: 'CON-01', ssc: SSC.construction, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'primary', weeks: 8,
    trades: ['construction'], pathways: ['wage', 'self'], physical: 'high', residential: false, next: null,
    title: t('Mason (general)', 'राजमिस्त्री (सामान्य)'),
    skills: [S('Brick and block laying', 'ईंट और ब्लॉक की चिनाई'), S('Plastering and levelling', 'प्लास्टर और लेवल'), S('Reading a simple drawing', 'साधारण नक्शा पढ़ना')],
    roles: t('Mason on a building site', 'निर्माण स्थल पर राजमिस्त्री'),
    enterprise: t('Take small building contracts', 'छोटे निर्माण के ठेके लेना'),
  },
  {
    id: 'CON-02', ssc: SSC.construction, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'primary', weeks: 6,
    trades: ['construction'], pathways: ['self', 'wage'], physical: 'medium', residential: false, next: null,
    title: t('Painter and decorator', 'पेंटर और डेकोरेटर'),
    skills: [S('Surface preparation', 'दीवार की तैयारी'), S('Paint mixing and finishing', 'रंग मिलाना और फिनिशिंग'), S('Estimating paint and cost', 'रंग और लागत का अनुमान')],
    roles: t('Painter with a contractor', 'ठेकेदार के साथ पेंटर'),
    enterprise: t('Run a painting team', 'पेंटिंग टीम चलाना'),
  },
  // ---------- labour -> skilled ----------
  {
    id: 'LAB-01', ssc: SSC.construction, centre: CENTRE.pmkk, nsqf: 2, minEdu: 'none', weeks: 4,
    trades: ['labour'], pathways: ['wage'], physical: 'high', residential: false, next: 'CON-01',
    title: t('Construction site helper (skilled labour)', 'निर्माण स्थल सहायक (कुशल मज़दूर)'),
    skills: [S('Site safety and tools', 'साइट पर सुरक्षा और औज़ार'), S('Mixing mortar and concrete', 'गारा और कंक्रीट मिलाना'), S('Working with a mason', 'राजमिस्त्री के साथ काम')],
    roles: t('Certified helper, first step to mason', 'प्रमाणित हेल्पर, राजमिस्त्री बनने की पहली सीढ़ी'),
    enterprise: t('Join a labour group with certified skills', 'प्रमाणित कौशल के साथ मज़दूर समूह में जुड़ना'),
  },
  // ---------- electrical / solar ----------
  {
    id: 'ELE-01', ssc: SSC.power, centre: CENTRE.iti, nsqf: 3, minEdu: 'class8', weeks: 12,
    trades: ['electrical'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: 'ELE-02',
    title: t('Assistant electrician', 'सहायक इलेक्ट्रीशियन'),
    skills: [S('Basic wiring and switchboards', 'बेसिक वायरिंग और स्विचबोर्ड'), S('Electrical safety', 'बिजली की सुरक्षा'), S('Using a multimeter', 'मल्टीमीटर का उपयोग')],
    roles: t('Helper with an electrical contractor', 'इलेक्ट्रिकल ठेकेदार के साथ सहायक'),
    enterprise: t('Home wiring and repair work', 'घर की वायरिंग और मरम्मत'),
  },
  {
    id: 'ELE-02', ssc: SSC.electronics, centre: CENTRE.iti, nsqf: 4, minEdu: 'class10', weeks: 16,
    trades: ['electrical'], pathways: ['self', 'wage'], physical: 'medium', residential: false, next: null,
    title: t('Domestic electrician and appliance repair', 'घरेलू इलेक्ट्रीशियन और उपकरण मरम्मत'),
    skills: [S('House wiring to code', 'नियम के अनुसार घर की वायरिंग'), S('Fan, inverter and appliance repair', 'पंखा, इन्वर्टर और उपकरण की मरम्मत'), S('Fault finding', 'खराबी ढूँढना')],
    roles: t('Electrician at a service company', 'सर्विस कंपनी में इलेक्ट्रीशियन'),
    enterprise: t('Open a repair and wiring service', 'मरम्मत और वायरिंग सेवा शुरू करना'),
  },
  {
    id: 'SOL-01', ssc: SSC.green, centre: CENTRE.pmkk, nsqf: 4, minEdu: 'class10', weeks: 8,
    trades: ['solar', 'electrical'], pathways: ['wage', 'self'], physical: 'medium', residential: true, next: null,
    title: t('Solar panel installation technician', 'सोलर पैनल इंस्टॉलेशन तकनीशियन'),
    skills: [S('Installing rooftop panels', 'छत पर पैनल लगाना'), S('Battery and inverter connection', 'बैटरी और इन्वर्टर जोड़ना'), S('Working safely at height', 'ऊँचाई पर सुरक्षित काम')],
    roles: t('Installer with a solar company', 'सोलर कंपनी में इंस्टॉलर'),
    enterprise: t('Local solar sales and service', 'स्थानीय सोलर बिक्री और सर्विस'),
  },
  // ---------- plumbing ----------
  {
    id: 'PLU-01', ssc: SSC.plumbing, centre: CENTRE.iti, nsqf: 3, minEdu: 'class8', weeks: 10,
    trades: ['plumbing'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: null,
    title: t('Plumber (general)', 'प्लंबर (सामान्य)'),
    skills: [S('Pipe fitting and leak repair', 'पाइप फिटिंग और लीकेज मरम्मत'), S('Bathroom and tap fitting', 'बाथरूम और नल की फिटिंग'), S('Reading a plumbing layout', 'प्लंबिंग नक्शा पढ़ना')],
    roles: t('Plumber with a contractor', 'ठेकेदार के साथ प्लंबर'),
    enterprise: t('Take home plumbing jobs', 'घरों में प्लंबिंग का काम लेना'),
  },
  // ---------- mechanic ----------
  {
    id: 'MEC-01', ssc: SSC.auto, centre: CENTRE.iti, nsqf: 4, minEdu: 'class8', weeks: 16,
    trades: ['mechanic'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: null,
    title: t('Two-wheeler service technician', 'दोपहिया वाहन सर्विस तकनीशियन'),
    skills: [S('Engine and brake servicing', 'इंजन और ब्रेक की सर्विस'), S('Using diagnostic tools', 'जाँच के औज़ारों का उपयोग'), S('Customer job cards', 'ग्राहक का जॉब कार्ड')],
    roles: t('Technician at a dealer workshop', 'डीलर वर्कशॉप में तकनीशियन'),
    enterprise: t('Open a bike repair garage', 'बाइक मरम्मत का गैरेज खोलना'),
  },
  {
    id: 'MEC-02', ssc: SSC.capital, centre: CENTRE.iti, nsqf: 3, minEdu: 'class8', weeks: 12,
    trades: ['mechanic'], pathways: ['wage', 'self'], physical: 'high', residential: true, next: null,
    title: t('Welder (arc and gas)', 'वेल्डर (आर्क और गैस)'),
    skills: [S('Arc and gas welding', 'आर्क और गैस वेल्डिंग'), S('Safety gear and fire safety', 'सुरक्षा उपकरण और आग से बचाव'), S('Grill and gate fabrication', 'ग्रिल और गेट बनाना')],
    roles: t('Welder in a fabrication unit', 'फैब्रिकेशन यूनिट में वेल्डर'),
    enterprise: t('Fabrication workshop for gates and grills', 'गेट और ग्रिल की वर्कशॉप'),
  },
  // ---------- driving ----------
  {
    id: 'DRI-01', ssc: SSC.auto, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'class8', weeks: 6,
    trades: ['driving'], pathways: ['wage', 'self'], physical: 'low', residential: false, next: null,
    title: t('Light motor vehicle driver', 'हल्के मोटर वाहन ड्राइवर'),
    skills: [S('Safe driving and road rules', 'सुरक्षित ड्राइविंग और ट्रैफ़िक नियम'), S('Basic vehicle checks', 'गाड़ी की बुनियादी जाँच'), S('Passenger and route handling', 'सवारी और रूट की समझ')],
    roles: t('Driver for a company or taxi service', 'कंपनी या टैक्सी सेवा में ड्राइवर'),
    enterprise: t('Own taxi or goods vehicle on loan', 'ऋण पर अपनी टैक्सी या माल गाड़ी'),
  },
  // ---------- beauty ----------
  {
    id: 'BEA-01', ssc: SSC.beauty, centre: CENTRE.rseti, nsqf: 3, minEdu: 'class8', weeks: 10,
    trades: ['beauty'], pathways: ['wage', 'self'], physical: 'low', residential: false, next: 'BEA-02',
    title: t('Assistant beauty therapist', 'सहायक ब्यूटी थेरेपिस्ट'),
    skills: [S('Threading, waxing and facials', 'थ्रेडिंग, वैक्सिंग और फेशियल'), S('Hygiene and tool care', 'साफ़-सफ़ाई और औज़ारों की देखभाल'), S('Basic hair care', 'बालों की बुनियादी देखभाल')],
    roles: t('Assistant in a salon', 'सैलून में सहायक'),
    enterprise: t('Home-based beauty services', 'घर से ब्यूटी सेवाएँ'),
  },
  {
    id: 'BEA-02', ssc: SSC.beauty, centre: CENTRE.rseti, nsqf: 4, minEdu: 'class10', weeks: 14,
    trades: ['beauty'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Beauty therapist and parlour owner', 'ब्यूटी थेरेपिस्ट और पार्लर संचालक'),
    skills: [S('Skin, hair and makeup services', 'स्किन, हेयर और मेकअप सेवाएँ'), S('Bridal and mehndi work', 'दुल्हन का मेकअप और मेहंदी'), S('Running a parlour: stock and bookings', 'पार्लर चलाना: सामान और बुकिंग')],
    roles: t('Beauty therapist in a salon', 'सैलून में ब्यूटी थेरेपिस्ट'),
    enterprise: t('Open your own parlour', 'अपना पार्लर खोलना'),
  },
  // ---------- cooking ----------
  {
    id: 'COO-01', ssc: SSC.hospitality, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'primary', weeks: 8,
    trades: ['cooking'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: null,
    title: t('Assistant cook and tiffin or catering service', 'सहायक रसोइया और टिफिन या कैटरिंग सेवा'),
    skills: [S('Cooking in bulk with hygiene', 'साफ़-सफ़ाई के साथ बड़ी मात्रा में खाना बनाना'), S('Food safety and storage', 'खाद्य सुरक्षा और भंडारण'), S('Menu costing and pricing', 'मेन्यू की लागत और दाम')],
    roles: t('Cook in a canteen, hotel or dhaba', 'कैंटीन, होटल या ढाबे में रसोइया'),
    enterprise: t('Start a tiffin or snacks business', 'टिफिन या नाश्ते का काम शुरू करना'),
  },
  // ---------- handicraft ----------
  {
    id: 'HAN-01', ssc: SSC.handicraft, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'none', weeks: 8,
    trades: ['handicraft'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Bamboo, cane and clay craft artisan', 'बांस, बेंत और मिट्टी शिल्पकार'),
    skills: [S('Modern designs for market', 'बाज़ार के लिए नए डिज़ाइन'), S('Finishing and packing', 'फिनिशिंग और पैकिंग'), S('Selling through fairs and online', 'मेले और ऑनलाइन बिक्री')],
    roles: t('Artisan in a craft cooperative', 'शिल्प सहकारी समिति में कारीगर'),
    enterprise: t('Make and sell craft products', 'शिल्प उत्पाद बनाकर बेचना'),
  },
  {
    id: 'HAN-02', ssc: SSC.furniture, centre: CENTRE.iti, nsqf: 3, minEdu: 'class8', weeks: 12,
    trades: ['handicraft'], pathways: ['self', 'wage'], physical: 'high', residential: false, next: null,
    title: t('Carpenter (furniture)', 'बढ़ई (फ़र्नीचर)'),
    skills: [S('Measuring, cutting and joinery', 'नाप, कटाई और जोड़ाई'), S('Using power tools safely', 'पावर टूल का सुरक्षित उपयोग'), S('Making doors, beds and cupboards', 'दरवाज़े, पलंग और अलमारी बनाना')],
    roles: t('Carpenter in a furniture unit', 'फ़र्नीचर यूनिट में बढ़ई'),
    enterprise: t('Run a carpentry workshop', 'बढ़ईगीरी की वर्कशॉप चलाना'),
  },
  // ---------- leather ----------
  {
    id: 'LEA-01', ssc: SSC.leather, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'primary', weeks: 10,
    trades: ['leather'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Footwear making and repair', 'जूते-चप्पल बनाना और मरम्मत'),
    skills: [S('Cutting and stitching footwear', 'जूते की कटाई और सिलाई'), S('Repair and polishing', 'मरम्मत और पॉलिश'), S('Working with new materials', 'नई सामग्री के साथ काम')],
    roles: t('Operator in a footwear unit', 'फुटवियर यूनिट में ऑपरेटर'),
    enterprise: t('Open a footwear repair and sale shop', 'जूते की मरम्मत और बिक्री की दुकान'),
  },
  // ---------- retail ----------
  {
    id: 'RET-01', ssc: SSC.retail, centre: CENTRE.pmkk, nsqf: 4, minEdu: 'class10', weeks: 8,
    trades: ['retail'], pathways: ['wage', 'self'], physical: 'low', residential: false, next: null,
    title: t('Retail sales associate', 'रिटेल सेल्स एसोसिएट'),
    skills: [S('Talking to customers and selling', 'ग्राहक से बात और बिक्री'), S('Billing and stock counting', 'बिलिंग और स्टॉक गिनती'), S('Simple digital payments', 'डिजिटल भुगतान')],
    roles: t('Sales associate in a store', 'दुकान या स्टोर में सेल्स एसोसिएट'),
    enterprise: t('Run a small kirana or stall better', 'किराना या स्टॉल को बेहतर चलाना'),
  },
  // ---------- computer ----------
  {
    id: 'COM-01', ssc: SSC.itites, centre: CENTRE.csc, nsqf: 4, minEdu: 'class10', weeks: 12,
    trades: ['computer'], pathways: ['wage', 'self'], physical: 'low', residential: false, next: null,
    title: t('Data entry operator', 'डेटा एंट्री ऑपरेटर'),
    skills: [S('Typing and spreadsheets', 'टाइपिंग और स्प्रेडशीट'), S('Data accuracy and checking', 'डेटा की सटीकता और जाँच'), S('Email and online forms', 'ईमेल और ऑनलाइन फ़ॉर्म')],
    roles: t('Data entry operator in an office', 'ऑफिस में डेटा एंट्री ऑपरेटर'),
    enterprise: t('Run an online forms and printing centre', 'ऑनलाइन फ़ॉर्म और प्रिंटिंग केंद्र'),
  },
  {
    id: 'COM-02', ssc: SSC.telecom, centre: CENTRE.pmkk, nsqf: 4, minEdu: 'class10', weeks: 12,
    trades: ['computer', 'electrical'], pathways: ['self', 'wage'], physical: 'low', residential: false, next: null,
    title: t('Mobile phone repair technician', 'मोबाइल फ़ोन मरम्मत तकनीशियन'),
    skills: [S('Diagnosing phone faults', 'फ़ोन की खराबी पहचानना'), S('Screen, battery and charging repair', 'स्क्रीन, बैटरी और चार्जिंग की मरम्मत'), S('Software reset and updates', 'सॉफ़्टवेयर रीसेट और अपडेट')],
    roles: t('Technician at a service centre', 'सर्विस सेंटर में तकनीशियन'),
    enterprise: t('Open a phone repair shop', 'फ़ोन मरम्मत की दुकान खोलना'),
  },
  // ---------- caregiving ----------
  {
    id: 'CAR-01', ssc: SSC.health, centre: CENTRE.hospital, nsqf: 4, minEdu: 'class10', weeks: 16,
    trades: ['caregiving'], pathways: ['wage'], physical: 'medium', residential: true, next: null,
    title: t('General duty assistant (patient care)', 'जनरल ड्यूटी असिस्टेंट (मरीज़ की देखभाल)'),
    skills: [S('Patient hygiene and mobility', 'मरीज़ की सफ़ाई और चलने-फिरने में मदद'), S('Taking pulse, temperature and BP', 'नाड़ी, तापमान और बीपी नापना'), S('Infection control', 'संक्रमण से बचाव')],
    roles: t('Assistant in a hospital or home care', 'अस्पताल या होम केयर में सहायक'),
    enterprise: t('Home-care service for elders', 'बुज़ुर्गों के लिए होम-केयर सेवा'),
  },
  // ---------- housekeeping ----------
  {
    id: 'HKP-01', ssc: SSC.hospitality, centre: CENTRE.pmkk, nsqf: 3, minEdu: 'primary', weeks: 6,
    trades: ['housekeeping'], pathways: ['wage', 'self'], physical: 'medium', residential: false, next: null,
    title: t('Housekeeping attendant', 'हाउसकीपिंग अटेंडेंट'),
    skills: [S('Room and washroom cleaning standards', 'कमरे और शौचालय की सफ़ाई के मानक'), S('Using cleaning chemicals safely', 'सफ़ाई के रसायनों का सुरक्षित उपयोग'), S('Laundry and linen', 'धुलाई और लिनेन')],
    roles: t('Housekeeping staff in hotels and offices', 'होटल और ऑफिस में हाउसकीपिंग स्टाफ़'),
    enterprise: t('Start a cleaning services team', 'सफ़ाई सेवा टीम शुरू करना'),
  },
];

const BY_ID = Object.fromEntries(COURSES.map((c) => [c.id, c]));

module.exports = { COURSES, BY_ID, SSC, CENTRE };
