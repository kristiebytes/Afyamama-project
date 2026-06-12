import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdkxqgxqInhIG-L0v7H_LJeqjAEap4B1s",
    authDomain: "afyamama-5cbaf.firebaseapp.com",
    projectId: "afyamama-5cbaf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentDoctorDocId = null; // Stores the specific Firestore document reference ID
let isEditing = false; // Flag to track state toggle switching

// Form Input Elements references
const inputs = document.querySelectorAll('#profileForm input:not(#docEmail), #profileForm select');
const profileBtn = document.getElementById('profileBtn');

/* ── 1. INITIALIZE PROFILE DATA ON AUTH STATE CHANGED ── */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Find the doctor document matching the signed-in Google email address
            const doctorsRef = collection(db, "doctors");
            const q = query(doctorsRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doctorDoc = querySnapshot.docs[0];
                currentDoctorDocId = doctorDoc.id; // Map document ID for future update updates
                const doctorData = doctorDoc.data();

                // Map data elements directly onto the input fields
                document.getElementById("docFirstName").value = doctorData.firstName || "";
                document.getElementById("docLastName").value = doctorData.lastName || "";
                document.getElementById("docEmail").value = doctorData.email || user.email;
                document.getElementById("docPhone").value = doctorData.phone || "";
                document.getElementById("docFacility").value = doctorData.facility || "";
                document.getElementById("docGender").value = doctorData.gender || "";
            } else {
                // Kick out unauthorized user data intrusions
                alert("Unauthorized Profile access detected.");
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Error loading doctor profile:", error);
        }
    } else {
        window.location.href = "login.html";
    }
});

/* ── 2. TOGGLE INTERFACE EDIT/SAVE CHANGES ACTION ── */
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop page refreshes on form submission tracks

    if (!isEditing) {
        // Switch into EDIT MODE
        inputs.forEach(input => input.disabled = false);
        profileBtn.innerText = "Save Changes";
        profileBtn.style.background = "#c9227a"; // Shift button highlight to pink while active
        isEditing = true;
    } else {
        // Perform SAVE OPERATION
        if (!currentDoctorDocId) {
            alert("Error: Missing database entry association.");
            return;
        }

        profileBtn.innerText = "Saving...";
        profileBtn.disabled = true;

        try {
            const docRef = doc(db, "doctors", currentDoctorDocId);
            
            // Push field layout keys directly into Firestore document entry reference block
            await updateDoc(docRef, {
                firstName: document.getElementById("docFirstName").value.trim(),
                lastName: document.getElementById("docLastName").value.trim(),
                phone: document.getElementById("docPhone").value.trim(),
                facility: document.getElementById("docFacility").value.trim(),
                gender: document.getElementById("docGender").value,
                updatedAt: new Date().toISOString()
            });

            alert("Profile updated successfully!");

            // Switch back to DISPLAY MODE
            inputs.forEach(input => input.disabled = true);
            profileBtn.innerText = "Edit Profile";
            profileBtn.style.background = "var(--primary-purple)";
            isEditing = false;
        } catch (error) {
            console.error("Error saving updates:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            profileBtn.disabled = false;
        }
    }
});

/* ── 3. LOGOUT CLICK MANAGEMENT ── */
document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch(err => console.error("Logout Error:", err));
});