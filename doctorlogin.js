import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdkxqgxqInhIG-L0v7H_LJeqjAEap4B1s",
    authDomain: "afyamama-5cbaf.firebaseapp.com",
    projectId: "afyamama-5cbaf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
    try {
        // 1. Authenticate via Google popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userEmail = user.email;

        // 2. Query Firestore to see if this email is an authorized doctor
        const doctorsRef = collection(db, "doctors");
        const q = query(doctorsRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // 3. IF EMAIL IS NOT IN DATABASE: Force sign out immediately and block access!
            await signOut(auth);
            alert("Access Denied: You are not an authorized medical personnel on this system.");
            return; 
        }

        // 4. IF EMAIL EXISTS: Proceed smoothly to dashboard
        console.log("Authorization verified for:", userEmail);
        window.location.href = "doctordashboard.html";

    } catch (error) {
        console.error("Auth Error:", error);
        alert("Authentication failed. Please try again.");
    }
});