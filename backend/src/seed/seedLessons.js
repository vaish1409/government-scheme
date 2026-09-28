// Sample lesson content. Replace mediaUrl with real hosted audio/video
// (S3, Cloudinary, YouTube unlisted, etc.) once you have actual content.

const lessons = [
  {
    title: 'What is a Bank Account and Why You Need One',
    description: 'A 2-minute explainer on opening your first zero-balance bank account.',
    category: 'finance',
    mediaType: 'audio',
    mediaUrl: 'https://example-cdn.com/audio/bank-account-basics-en.mp3',
    durationSeconds: 120,
    language: 'en',
    orderIndex: 1,
    fileSizeKb: 1800,
  },
  {
    title: 'How to Save Money Every Month',
    description: 'Simple tips to start a savings habit, even on a small income.',
    category: 'finance',
    mediaType: 'audio',
    mediaUrl: 'https://example-cdn.com/audio/monthly-savings-en.mp3',
    durationSeconds: 150,
    language: 'en',
    orderIndex: 2,
    fileSizeKb: 2100,
  },
  {
    title: 'How to Use a Smartphone Safely',
    description: 'Avoiding scams, OTP fraud, and basic digital safety.',
    category: 'digital_literacy',
    mediaType: 'audio',
    mediaUrl: 'https://example-cdn.com/audio/digital-safety-en.mp3',
    durationSeconds: 140,
    language: 'en',
    orderIndex: 1,
    fileSizeKb: 2000,
  },
];

module.exports = lessons;
