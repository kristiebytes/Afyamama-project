import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/* Fetch Doctor Name */

onAuthStateChanged(auth, async(user)=>{

   if (user) { // Fetch the doctor profile by searching for their verified authenticated email
        const doctorsRef = collection(db, "doctors");
        const q = query(doctorsRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Grab the first matching doctor document found
            const doctorDoc = querySnapshot.docs[0];
            const doctorData = doctorDoc.data();
            
            const welcomeElement = document.getElementById("doctorWelcome");
            if (welcomeElement) {
                welcomeElement.innerText = `Welcome, Dr. ${doctorData.firstName}`;
            }
        } else {
            // Safety fallback: if they somehow bypassed doctorlogin.html without an email entry, kick them out
            window.location.href = "doctorlogin.html";
        }
    } else {
        window.location.href = "doctorlogin.html";
    }
});

/* Temporary Sample Patients */

const patients = [

{
    id:"M001",
    name:"Mary Wanjiku",
    appointmentType:"ANC VISIT"
},

{
    id:"M002",
    name:"Faith Njeri",
    appointmentType:"ANC VISIT"
},

{
    id:"M003",
    name:"Joy Achieng",
    appointmentType:"ANC VISIT"
}

];

const patientTable =
document.getElementById("patientTable");

patients.forEach(patient=>{

    patientTable.innerHTML += `

    <tr>

        <td>

            <a class="patient-link"
            href="anc-details.html?id=${patient.id}">
            ${patient.name}
            </a>

        </td>

        <td>${patient.appointmentType}</td>

        <td>

            <button
            class="open-btn"
            onclick="openPatient('${patient.id}')">

            Open

            </button>

        </td>

    </tr>

    `;
});

/* Search Patients */

const searchInput =
document.getElementById("searchInput");

searchInput.addEventListener("keyup",()=>{

    const value =
    searchInput.value.toLowerCase();

    const results =
    patients.filter(patient=>

        patient.name.toLowerCase().includes(value)
        ||
        patient.id.toLowerCase().includes(value)

    );

    displayResults(results);

});

function displayResults(results){

    const container =
    document.getElementById("searchResults");

    container.innerHTML="";

    results.forEach(patient=>{

        container.innerHTML += `

        <div class="search-result">

            <a
            href="anc-details.html?id=${patient.id}">
            ${patient.name}
            </a>

        </div>

        `;
    });

}

window.openPatient = function(id){

    window.location.href =
    `anc-details.html?id=${id}`;

}