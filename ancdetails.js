import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdkxqgxqInhIG-L0v7H_LJeqjAEap4B1s",
    authDomain: "afyamama-5cbaf.firebaseapp.com",
    projectId: "afyamama-5cbaf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const motherId = params.get("motherId");

/* ── MODAL UI HANDLERS ── */
const visitModal = document.getElementById("visitModal");
document.getElementById("addVisitBtn").addEventListener("click", () => visitModal.style.display = "block");
document.getElementById("closeModal").addEventListener("click", () => visitModal.style.display = "none");
document.getElementById("cancelVisit").addEventListener("click", () => visitModal.style.display = "none");

/* ── LOAD MOTHER FILE ── */
async function loadMother(){
    const motherRef = doc(db, "mothers", motherId);
    const motherSnap = await getDoc(motherRef);

    if(motherSnap.exists()){
        const mother = motherSnap.data();
        document.getElementById("motherName").textContent = mother.fullName;
        document.getElementById("motherAge").textContent = mother.age;
        document.getElementById("motherPhone").textContent = mother.phone;
        document.getElementById("motherGestation").textContent = mother.gestationAge;
        document.getElementById("motherEDD").textContent = mother.expectedDeliveryDate;
    }
}
loadMother();

/* ── LOAD PREVIOUS ANC VISITS AS ACCORDIONS ── */
async function loadVisits(){
    const visitContainer = document.getElementById("visitHistory");
    visitContainer.innerHTML = "";

    const q = query(
        collection(db, "anc_visits"),
        where("motherId", "==", motherId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        visitContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No previous visits recorded.</p>`;
        return;
    }

    snapshot.forEach((visitDoc) => {
        const visit = visitDoc.data();
        
        // Format dates beautifully if raw date element strings are recorded (yyyy-mm-dd -> dd MMM yyyy)
        let formattedDate = visit.visitDate;
        try {
            if(visit.visitDate.includes("-")) {
                const options = { day: 'numeric', month: 'short', year: 'numeric' };
                formattedDate = new Date(visit.visitDate).toLocaleDateString('en-GB', options);
            }
        } catch(e) { console.error(e); }

        // Get the first digit of the contact layout (e.g., "4th Contact" -> "4")
        const displayDigit = visit.contactNo ? visit.contactNo.match(/\d+/) : "v";

        // HTML injection using native interactive <details> and <summary> setups
        visitContainer.innerHTML += `
            <details style="background: #faf8fc; border: 1px solid #ebdff5; border-radius: 8px; margin-bottom: 12px; padding: 14px;">
                <summary style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; list-style: none;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="background: #510c75; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                            ${displayDigit}
                        </span>
                        <div>
                            <span style="color: #4a0072; font-weight: bold; font-size: 15px;">${visit.contactNo || 'Visit Entry'}</span>
                            <span style="color: #666; font-size: 14px; margin-left: 6px;">• ${formattedDate}</span>
                            <div style="color: #666; font-size: 13px; margin-top: 3px; letter-spacing: 0.3px;">
                                GA: ${visit.gestationWeeks || '--'} wks &nbsp;|&nbsp; BP: ${visit.bloodPressure || '--'} &nbsp;|&nbsp; FHR: ${visit.fetalHeartRate || '--'} bpm
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button class="delete-visit-btn" data-id="${visitDoc.id}" title="Delete Record"
                            style="background: #fff5f5; color: #dc3545; border: 1px solid #feb2b2; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 5px;">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                        <i class="fa-solid fa-chevron-down" style="color: #6f42c1; font-size: 14px;"></i>
                    </div>
                </summary>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ebdff5; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13.5px; color: #444;">
                    <div><strong>Facility / Clinic:</strong> ${visit.facility || 'N/A'}</div>
                    <div><strong>Maternal Weight:</strong> ${visit.weight ? visit.weight + ' kg' : 'N/A'}</div>
                    <div><strong>Haemoglobin (Hb):</strong> ${visit.hb ? visit.hb + ' g/dL' : 'N/A'}</div>
                    <div><strong>Urine Status:</strong> ${visit.urine || 'N/A'}</div>
                    <div><strong>Fundal Height:</strong> ${visit.fundalHeight ? visit.fundalHeight + ' cm' : 'N/A'}</div>
                    <div><strong>Fetal Presentation:</strong> ${visit.presentation || 'N/A'}</div>
                    <div><strong>Fetal Movement:</strong> ${visit.fetalMovement || 'N/A'}</div>
                    <div><strong>HIV Status:</strong> ${visit.hiv || 'N/A'}</div>
                    <div><strong>Iron & Folic Acid:</strong> ${visit.ifa || 'N/A'}</div>
                    <div><strong>TT Vaccination:</strong> ${visit.tt || 'N/A'}</div>
                    <div style="grid-column: span 2;"><strong>Next Scheduled Appointment Date:</strong> ${visit.nextVisitDate || 'N/A'}</div>
                    <div style="grid-column: span 2; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #eee; margin-top: 5px; line-height: 1.4;">
                        <strong>Clinical Notes & Plan:</strong><br><span style="color:#555;">${visit.notes || 'No custom notes logged.'}</span>
                    </div>
                </div>
            </details>
        `;
    });
}
loadVisits();

/* ── SAVE NEW ANC VISIT WITH EXTENDED KEYS ── */
document.getElementById("ancForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, "anc_visits"), {
            motherId: motherId,
            contactNo: document.getElementById("f_contactNo").value,
            visitDate: document.getElementById("f_date").value,
            gestationWeeks: document.getElementById("f_gestationWeeks").value,
            facility: document.getElementById("f_facility").value,
            weight: document.getElementById("f_weight").value,
            bloodPressure: document.getElementById("f_bp").value,
            hb: document.getElementById("f_hb").value,
            urine: document.getElementById("f_urine").value,
            fundalHeight: document.getElementById("f_fundalHeight").value,
            presentation: document.getElementById("f_presentation").value,
            fetalHeartRate: document.getElementById("f_fhr").value,
            fetalMovement: document.getElementById("f_fetalMovement").value,
            hiv: document.getElementById("f_hiv").value,
            ifa: document.getElementById("f_ifa").value,
            tt: document.getElementById("f_tt").value,
            nextVisitDate: document.getElementById("f_nextVisit").value,
            notes: document.getElementById("f_notes").value
        });

        alert("ANC Visit Saved Successfully");
        document.getElementById("ancForm").reset();
        visitModal.style.display = "none"; // Close modal window popup
        loadVisits(); // Refresh list immediately
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to save ANC record.");
    }
});

/* ── DELETE VISIT TRACKING EVENT ── */
document.getElementById("visitHistory").addEventListener("click", async (e) => {
    // Correctly find the button wrapper even if clicking the inside FontAwesome icon
    const targetBtn = e.target.closest(".delete-visit-btn");
    if (!targetBtn) return;

    const visitId = targetBtn.getAttribute("data-id");
    
    if (visitId) {
        if (confirm("Are you sure you want to remove this dummy record?")) {
            try {
                await deleteDoc(doc(db, "anc_visits", visitId));
                loadVisits(); 
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert("Failed to delete record.");
            }
        }
    }
});