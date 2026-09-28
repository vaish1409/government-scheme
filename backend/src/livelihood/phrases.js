/**
 * Spoken / displayed phrases used by the interview engine.
 * vocab.js holds the keywords and the questions; this file holds the small
 * sentences the assistant says around them. To add a language, add one more
 * key next to `en` and `hi` in each entry.
 *
 * Hindi lines are written gender-neutral (we / passive) because the assistant
 * does not know the speaker's gender.
 */

const PH = {
  greeting: {
    en: 'Namaste! We will ask a few simple questions to find training and work that suits you. You can speak or type. Let us begin.',
    hi: 'नमस्ते! हम आपसे कुछ आसान सवाल पूछेंगे ताकि आपके लिए सही ट्रेनिंग और काम ढूँढा जा सके। आप बोल सकते हैं या लिख सकते हैं। शुरू करते हैं।',
  },
  ack: [
    { en: 'Thank you.', hi: 'धन्यवाद।' },
    { en: 'Okay.', hi: 'ठीक है।' },
    { en: 'Understood.', hi: 'समझ गए।' },
  ],
  reprompt: {
    en: 'Sorry, we could not catch that. Please say it once more.',
    hi: 'माफ़ कीजिए, हम समझ नहीं पाए। कृपया एक बार फिर बताइए।',
  },
  skipped: {
    en: 'That is alright, we will skip this one.',
    hi: 'कोई बात नहीं, इसे छोड़ देते हैं।',
  },
  done: {
    en: 'We have what we need. Now we will look for the best training for you.',
    hi: 'हमें ज़रूरी जानकारी मिल गई। अब आपके लिए सबसे अच्छी ट्रेनिंग ढूँढते हैं।',
  },
  and: { en: ' and ', hi: ' और ' },

  // Confirmation sentences, one per field. {v} is filled in by extract.js.
  confirm: {
    state: { en: 'You live in {v}.', hi: 'आप {v} में रहते हैं।' },
    age: { en: 'You are {v} years old.', hi: 'आपकी उम्र {v} साल है।' },
    education: { en: 'You studied up to {v}.', hi: 'आपने {v} तक पढ़ाई की है।' },
    familyOccupation: { en: 'Your family works in {v}.', hi: 'आपके परिवार में यह काम होता है: {v}।' },
    familyOccupationNone: { en: 'Your family has no traditional trade.', hi: 'आपके परिवार में कोई पारंपरिक काम नहीं है।' },
    currentActivity: { en: 'You now work in {v}.', hi: 'आप अभी यह काम करते हैं: {v}।' },
    currentActivityNone: { en: 'You are not earning from work right now.', hi: 'आप अभी कमाई का कोई काम नहीं कर रहे हैं।' },
    interests: { en: 'You would like to learn {v}.', hi: 'आप यह सीखना चाहते हैं: {v}।' },
    interestsNone: { en: 'You have no particular trade in mind yet.', hi: 'अभी आपके मन में कोई खास काम नहीं है।' },
    localWork: { en: 'People near you work in {v}.', hi: 'आपके आसपास यह काम मिलता है: {v}।' },
    localWorkNone: { en: 'Not much work is available near you.', hi: 'आपके आसपास ज़्यादा काम नहीं मिलता।' },
    travel_local: { en: 'You need training close to home.', hi: 'आपको घर के पास ट्रेनिंग चाहिए।' },
    travel_district: { en: 'You can travel within your district.', hi: 'आप अपने जिले में आ-जा सकते हैं।' },
    travel_anywhere: { en: 'You can travel for training.', hi: 'आप ट्रेनिंग के लिए बाहर जा सकते हैं।' },
    physical_true: { en: 'We will avoid physically heavy work.', hi: 'हम भारी शारीरिक मेहनत वाले काम नहीं सुझाएँगे।' },
    pref_self: { en: 'You prefer your own small business.', hi: 'आप अपना छोटा काम शुरू करना चाहते हैं।' },
    pref_wage: { en: 'You prefer a job with a salary.', hi: 'आप नौकरी करना चाहते हैं।' },
    pref_either: { en: 'You are open to a job or your own business.', hi: 'आप नौकरी या अपना काम, दोनों के लिए तैयार हैं।' },
  },
};

module.exports = { PH };
