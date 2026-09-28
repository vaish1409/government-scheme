/**
 * Local opportunity data (PROTOTYPE, ILLUSTRATIVE).
 *
 * demand[state][trade] = 3 (high) | 2 (steady) ; a missing trade counts as 1 (low).
 * The values are a hand-made sketch of where each kind of work is common, so the
 * recommender can prefer trades that actually have work nearby.
 *
 * Replace with real inputs: District Skill Development Plans, PLFS / NCS job
 * postings, MSME cluster lists and the state skill missions' demand surveys.
 * The recommender only needs `level(state, trade)` and `note(state)`.
 */

const t = (en, hi) => ({ en, hi });

const DEMAND = {
  'Andhra Pradesh': { farming: 3, dairy: 3, tailoring: 2, electrical: 2, mechanic: 2, cooking: 2, construction: 2 },
  'Assam': { weaving: 3, handicraft: 3, farming: 3, dairy: 2, cooking: 2, tailoring: 2 },
  'Bihar': { farming: 3, dairy: 3, construction: 3, tailoring: 2, retail: 2, driving: 2, mechanic: 2 },
  'Chhattisgarh': { farming: 3, handicraft: 2, construction: 2, dairy: 2, mechanic: 2, weaving: 2 },
  'Delhi': { retail: 3, housekeeping: 3, computer: 3, driving: 3, cooking: 2, beauty: 3, caregiving: 2, electrical: 2 },
  'Gujarat': { tailoring: 3, mechanic: 3, construction: 2, dairy: 3, solar: 3, retail: 2, electrical: 2 },
  'Haryana': { mechanic: 3, driving: 3, dairy: 3, farming: 2, housekeeping: 2, electrical: 2, retail: 2 },
  'Himachal Pradesh': { farming: 3, dairy: 2, driving: 3, cooking: 3, handicraft: 2, electrical: 2 },
  'Jharkhand': { construction: 3, farming: 3, handicraft: 2, labour: 3, dairy: 2, mechanic: 2 },
  'Karnataka': { computer: 3, tailoring: 3, electrical: 2, caregiving: 3, driving: 2, construction: 2, solar: 2 },
  'Kerala': { caregiving: 3, construction: 3, driving: 2, cooking: 3, housekeeping: 3, electrical: 2, plumbing: 2 },
  'Madhya Pradesh': { farming: 3, dairy: 2, construction: 3, solar: 2, driving: 2, weaving: 2, tailoring: 2 },
  'Maharashtra': { construction: 3, cooking: 2, electrical: 3, mechanic: 3, retail: 3, caregiving: 2, tailoring: 2, plumbing: 2 },
  'Odisha': { handicraft: 3, weaving: 3, farming: 3, construction: 2, cooking: 2, tailoring: 2 },
  'Punjab': { farming: 3, dairy: 3, mechanic: 3, driving: 2, tailoring: 2, retail: 2 },
  'Rajasthan': { handicraft: 3, construction: 3, solar: 3, dairy: 2, leather: 2, tailoring: 2, weaving: 2 },
  'Tamil Nadu': { tailoring: 3, mechanic: 3, electrical: 3, weaving: 2, caregiving: 2, retail: 2, leather: 3 },
  'Telangana': { construction: 3, computer: 3, weaving: 2, solar: 2, electrical: 2, caregiving: 2, driving: 2 },
  'Uttar Pradesh': { construction: 3, farming: 3, dairy: 3, weaving: 2, leather: 3, handicraft: 3, mechanic: 2, retail: 2, tailoring: 2 },
  'Uttarakhand': { cooking: 3, driving: 3, farming: 2, handicraft: 2, dairy: 2, electrical: 2 },
  'West Bengal': { weaving: 3, handicraft: 3, farming: 2, tailoring: 3, leather: 2, retail: 2, construction: 2 },
};

const NOTES = {
  'Andhra Pradesh': t('Farming, dairy and small workshops lead.', 'खेती, डेयरी और छोटी वर्कशॉप में ज़्यादा काम है।'),
  'Assam': t('Handloom, bamboo craft and farming lead.', 'हथकरघा, बांस शिल्प और खेती में ज़्यादा काम है।'),
  'Bihar': t('Farming, dairy and building work lead.', 'खेती, डेयरी और निर्माण कार्य में ज़्यादा काम है।'),
  'Chhattisgarh': t('Farming, crafts and building work lead.', 'खेती, शिल्प और निर्माण कार्य में ज़्यादा काम है।'),
  'Delhi': t('Shops, services and offices lead.', 'दुकानों, सेवा क्षेत्र और ऑफिस में ज़्यादा काम है।'),
  'Gujarat': t('Garments, workshops, dairy and solar lead.', 'गारमेंट, वर्कशॉप, डेयरी और सोलर में ज़्यादा काम है।'),
  'Haryana': t('Vehicle repair, driving and dairy lead.', 'गाड़ी मरम्मत, ड्राइविंग और डेयरी में ज़्यादा काम है।'),
  'Himachal Pradesh': t('Farming, tourism, driving and food service lead.', 'खेती, पर्यटन, ड्राइविंग और फूड सर्विस में ज़्यादा काम है।'),
  'Jharkhand': t('Building work, farming and crafts lead.', 'निर्माण कार्य, खेती और शिल्प में ज़्यादा काम है।'),
  'Karnataka': t('IT-enabled work, garments and care work lead.', 'आईटी से जुड़े काम, गारमेंट और देखभाल में ज़्यादा काम है।'),
  'Kerala': t('Care work, building work and food service lead.', 'देखभाल, निर्माण कार्य और फूड सर्विस में ज़्यादा काम है।'),
  'Madhya Pradesh': t('Farming, building work and dairy lead.', 'खेती, निर्माण कार्य और डेयरी में ज़्यादा काम है।'),
  'Maharashtra': t('Building work, electrical, repair and retail lead.', 'निर्माण, बिजली, मरम्मत और रिटेल में ज़्यादा काम है।'),
  'Odisha': t('Crafts, handloom and farming lead.', 'शिल्प, हथकरघा और खेती में ज़्यादा काम है।'),
  'Punjab': t('Farming, dairy and machine repair lead.', 'खेती, डेयरी और मशीन मरम्मत में ज़्यादा काम है।'),
  'Rajasthan': t('Crafts, building work and solar lead.', 'शिल्प, निर्माण कार्य और सोलर में ज़्यादा काम है।'),
  'Tamil Nadu': t('Garments, repair, electrical and leather lead.', 'गारमेंट, मरम्मत, बिजली और चमड़ा उद्योग में ज़्यादा काम है।'),
  'Telangana': t('Building work, IT-enabled work and handloom lead.', 'निर्माण, आईटी से जुड़े काम और हथकरघा में ज़्यादा काम है।'),
  'Uttar Pradesh': t('Building work, farming, dairy, leather and crafts lead.', 'निर्माण, खेती, डेयरी, चमड़ा और शिल्प में ज़्यादा काम है।'),
  'Uttarakhand': t('Food service, driving and farming lead.', 'फूड सर्विस, ड्राइविंग और खेती में ज़्यादा काम है।'),
  'West Bengal': t('Handloom, crafts, garments and farming lead.', 'हथकरघा, शिल्प, गारमेंट और खेती में ज़्यादा काम है।'),
};

/** 0 = unknown state, 1 = low, 2 = steady, 3 = high */
function level(state, trade) {
  const row = DEMAND[state];
  if (!row) return 0;
  return row[trade] || 1;
}

function topTrades(state, n = 3) {
  const row = DEMAND[state];
  if (!row) return [];
  return Object.entries(row)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([trade, lvl]) => ({ trade, level: lvl }));
}

const note = (state) => NOTES[state] || null;

module.exports = { DEMAND, level, topTrades, note };
