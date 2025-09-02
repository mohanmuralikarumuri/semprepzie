const admin = require('firebase-admin');
const serviceAccount = require('./semprepzie-315b1-firebase-adminsdk-fbsvc-3adaf8c8b8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set admin claim for a user by email
async function setAdminByEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for user: ${email}`);
    console.log(`User UID: ${user.uid}`);
  } catch (error) {
    console.error('❌ Error setting admin claim:', error.message);
  }
  process.exit();
}

// Get email from command line argument or use default
const email = process.argv[2] || 'semprepzie@gmail.com';

console.log(`Setting admin claim for: ${email}`);
setAdminByEmail(email);
