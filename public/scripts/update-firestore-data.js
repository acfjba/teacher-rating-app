const admin = require("firebase-admin");
const serviceAccount = require("./teacherratingapp-firebase-adminsdk-fbsvc-628e4da7a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateData() {
  try {
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userRef = db.collection("users").doc(userDoc.id);

      // Update login status randomly
      const newStatus = Math.random() > 0.5 ? "loggedIn" : "loggedOut";
      await userRef.update({ status: newStatus });

      // Add log to admin_summary_logs collection
      await db.collection("admin_summary_logs").add({
        email: user.email,
        role: user.role,
        status: newStatus,
        schoolID: user.schoolID,
        updatedAt: new Date(),
      });

      console.log(`✅ Updated ${user.email} to ${newStatus}`);
    }

    console.log("🔥 All user statuses updated and logs added.");
  } catch (error) {
    console.error("❌ Error updating Firestore:", error);
  }
}

updateData();
