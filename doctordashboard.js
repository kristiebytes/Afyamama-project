import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration Block
const firebaseConfig = {
    apiKey: "AIzaSyDdkxqgxqInhIG-L0v7H_LJeqjAEap4B1s",
    authDomain: "afyamama-5cbaf.firebaseapp.com",
    projectId: "afyamama-5cbaf",
    storageBucket: "afyamama-5cbaf.firebasestorage.app",
    messagingSenderId: "973201830551",
    appId: "1:973201830551:web:04db5011ab139f4d16efd2",
    measurementId: "G-K6321ZYT7N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global list array to hold active parsed records for local searching functions
let todayMothersList = [];

/* ── 1. AUTH STATE GATEWAY CHECK ── */
onAuthStateChanged(auth, async (user) => {
    if (user) { 
        try {
            const doctorsRef = collection(db, "doctors");
            const q = query(doctorsRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doctorDoc = querySnapshot.docs[0];
                const doctorData = doctorDoc.data();
                
                const welcomeElement = document.getElementById("doctorWelcome");
                if (welcomeElement) {
                    welcomeElement.innerText = `Welcome, Dr. ${doctorData.firstName}`;
                }

                // Credentials confirmed! Fetch live maternal schedule from Firestore
                loadTodayAppointments();
            } else {
                window.location.href = "doctorlogin.html";
            }
        } catch (error) {
            console.error("Authentication validation failed:", error);
        }
    } else {
        window.location.href = "doctorlogin.html";
    }
});

/* ── 2. FETCH TODAY'S APPOINTMENTS DYNAMICALLY FROM DB ── */
async function loadTodayAppointments() {
    const motherTable = document.getElementById("patientTable");
    if (!motherTable) return;

    try {
        // Formats current system timestamp directly into clean string format: YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        console.log("Searching Firestore for appointments on date:", todayStr);
        
        // Find documents inside 'appointments' collection scheduled for today
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("date", "==", todayStr));
        const querySnapshot = await getDocs(q);

        console.log("Total appointment documents found:", querySnapshot.size);

        motherTable.innerHTML = ""; // Wipe loading indicators/hardcoded items safely
        todayMothersList = [];     // Clear internal structural collection cache arrays

        if (querySnapshot.empty) {
            motherTable.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px; color:#736275;">No appointments scheduled for today.</td></tr>`;
            return;
        }

        // Loop through the appointments found
        for (const appointmentDoc of querySnapshot.docs) {
            const appointmentData = appointmentDoc.data();
            
            // Safety: Look for camelCase OR snake_case variant keys from the database document
            const motherId = appointmentData.motherId || appointmentData.mother_id;

            // If a document doesn't have a motherId property, skip it safely without throwing exceptions!
            if (!motherId) {
                console.warn(`Skipping appointment [${appointmentDoc.id}] because it lacks a valid mother link field.`);
                continue; 
            }

            try {
                // Fetch the specific mother's full profile info from the 'mothers' collection
                const motherDocRef = doc(db, "mothers", motherId); 
                const motherDocSnap = await getDoc(motherDocRef);

                let motherName = "Unknown Mother";
                if (motherDocSnap.exists()) {
                    motherName = motherDocSnap.data().full_name; // Grabs 'full_name' field to match your ERD
                } else {
                    console.warn(`Could not find a matching profile in 'mothers' collection for ID: ${motherId}`);
                }

                const cleanRecord = {
                    id: motherId,
                    name: motherName,
                    appointmentType: appointmentData.appointmentType || "ANC VISIT"
                };

                todayMothersList.push(cleanRecord);
                renderMotherRow(cleanRecord);

            } catch (innerError) {
                console.error(`Error loading personal data details for mother ID ${motherId}:`, innerError);
            }
        }
    } catch (error) {
        console.error("Critical failure pulling current clinical schedules:", error);
        motherTable.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red; padding:20px;">Failed to load appointments: ${error.message}</td></tr>`;
    }
}

function renderMotherRow(mother) {
    const motherTable = document.getElementById("patientTable");
    motherTable.innerHTML += `
        <tr>
            <td>
                <a class="patient-link" href="anc-details.html?id=${mother.id}">
                    ${mother.name}
                </a>
            </td>
            <td>${mother.appointmentType}</td>
            <td>
                <button class="open-btn" onclick="openMother('${mother.id}')">
                    Open
                </button>
            </td>
        </tr>
    `;
}

/* ── 3. SEARCH OPERATIONS ACROSS ACTIVE LOCAL CONTEXT DATA ── */
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        const value = searchInput.value.toLowerCase().trim();

        // Filters our list populated straight from the database
        const results = todayMothersList.filter(mother =>
            mother.name.toLowerCase().includes(value) ||
            mother.id.toLowerCase().includes(value)
        );

        displayResults(results);
    });
}

function displayResults(results) {
    const container = document.getElementById("searchResults");
    if (!container) return;
    
    container.innerHTML = "";

    if (results.length === 0) {
        container.innerHTML = `<div class="search-result" style="color:#736275; padding:10px;">No matching appointments found today</div>`;
        return;
    }

    results.forEach(mother => {
        container.innerHTML += `
            <div class="search-result">
                <a href="anc-details.html?id=${mother.id}">
                    ${mother.name}
                </a>
            </div>
        `;
    });
}

/* ── 4. LOGOUT OPERATION IMPLEMENTATION ── */
document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        window.location.href = "doctorlogin.html";
    }).catch(err => console.error("Logout execution error:", err));
});

/* ── 5. EXPOSE WINDOW-LINK NAVIGATION HELPER FUNCTIONS ── */
window.openMother = function(id) {
    window.location.href = `anc-details.html?id=${id}`;
};