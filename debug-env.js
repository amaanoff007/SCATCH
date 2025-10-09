require('dotenv').config();

console.log('Raw process.env keys:');
console.log(Object.keys(process.env).filter(key => key.includes('EMAIL')));

console.log('\nDirect access:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

console.log('\nAll env vars starting with EMAIL:');
for (const key in process.env) {
  if (key.startsWith('EMAIL')) {
    console.log(`${key}: ${process.env[key]}`);
  }
}
