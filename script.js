console.log("SCRIPT CARGADO");
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "barberia-nizalin.firebaseapp.com",
  projectId: "barberia-nizalin",
  storageBucket: "barberia-nizalin.appspot.com",
  messagingSenderId: "923227885524",
  appId: "TU_APP_ID_REAL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase conectado");


// DATOS SIMULADOS (luego Firebase los sustituye)
const services = [
  { name: "Corte clásico", duration: 30, price: 15 },
  { name: "Fade / Degradado", duration: 35, price: 18 },
  { name: "Arreglo de barba", duration: 20, price: 12 },
  { name: "Corte + Barba", duration: 45, price: 25 }
];

const barbers = [
  { name: "Carlos" },
  { name: "Adrián" },
  { name: "Miguel" }
];

const hours = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "16:00", "16:30", "17:00"
];

// ESTADO
let selectedService = null;
let selectedBarber = null;
let selectedDate = null;
let selectedHour = null;
let clientName = "";


// CONTENEDORES
const servicesContainer = document.querySelector(".js-services");
const barbersContainer = document.querySelector(".js-barbers");
const hoursContainer = document.querySelector(".js-hours");

// RESUMEN
const summaryService = document.getElementById("summary-service");
const summaryBarber = document.getElementById("summary-barber");
const summaryDate = document.getElementById("summary-date");
const summaryHour = document.getElementById("summary-hour");
const summaryClient = document.getElementById("summary-client");

// HELPERS
function clearActive(container) {
  [...container.children].forEach(el => el.classList.remove("active"));
}
async function getReservedHours(barberName, date) {
  const q = query(
    collection(db, "appointments"),
    where("barber", "==", barberName),
    where("date", "==", date)
  );

  const snapshot = await getDocs(q);
  const reserved = [];

  snapshot.forEach(doc => {
    reserved.push(doc.data().time);
  });

  return reserved;
}


// RENDER SERVICIOS
services.forEach(service => {
  const btn = document.createElement("button");
  btn.textContent = `${service.name} · ${service.duration} min · ${service.price}€`;
  btn.className = "option";

  btn.onclick = () => {
    clearActive(servicesContainer);
    btn.classList.add("active");
    selectedService = service;
    summaryService.textContent = service.name;
    renderHours();
  };

  servicesContainer.appendChild(btn);
});

// RENDER BARBEROS
barbers.forEach(barber => {
  const btn = document.createElement("button");
  btn.textContent = barber.name;
  btn.className = "option";

  btn.onclick = () => {
    clearActive(barbersContainer);
    btn.classList.add("active");
    selectedBarber = barber;
    summaryBarber.textContent = barber.name;
    renderHours();
  };

  barbersContainer.appendChild(btn);
});

// FECHA
document.getElementById("booking-date").addEventListener("change", e => {
  selectedDate = e.target.value;
  summaryDate.textContent = selectedDate;
  renderHours();
});
document.getElementById("client-name").addEventListener("input", e => {
  clientName = e.target.value.trim();
  summaryClient.textContent = clientName || "Sin escribir";
});


// HORAS
async function renderHours() {
  hoursContainer.innerHTML = "";

  if (!selectedService || !selectedBarber || !selectedDate) return;

  // 🔥 Obtener horas ya reservadas desde Firebase
  const reservedHours = await getReservedHours(
    selectedBarber.name,
    selectedDate
  );

  hours.forEach(hour => {
    // ❌ Si la hora ya está reservada, NO se muestra
    if (reservedHours.includes(hour)) return;

    const btn = document.createElement("button");
    btn.textContent = hour;
    btn.className = "option";

    btn.onclick = () => {
      clearActive(hoursContainer);
      btn.classList.add("active");
      selectedHour = hour;
      summaryHour.textContent = hour;
    };

    hoursContainer.appendChild(btn);
  });
}


// CONFIRMAR Y GUARDAR EN FIREBASE
document.getElementById("confirm").onclick = async () => {
  if (!selectedService || !selectedBarber || !selectedDate || !selectedHour) {
    alert("Completa todos los pasos");
    return;
  }

  try {
   await addDoc(collection(db, "appointments"), {
  service: selectedService.name,
  barber: selectedBarber.name,
  date: selectedDate,
  time: selectedHour,
  client: clientName,
  createdAt: serverTimestamp()
});


    alert(
`Reserva confirmada:
${selectedService.name}
${selectedBarber.name}
${selectedDate} a las ${selectedHour}`
    );
// 🔄 Resetear selección
selectedHour = null;
summaryHour.textContent = "Sin seleccionar";

// 🔄 Volver a cargar horas (la reservada desaparecerá)
renderHours();


    console.log("✅ Cita guardada en Firestore");

  } catch (error) {
    console.error("❌ Error al guardar la cita:", error);
    alert("Error al guardar la cita");
  }
};



// ===============================
// PANEL ADMIN - CARGAR CITAS
// ===============================

const adminContainer = document.getElementById("admin-appointments");

async function loadAdminAppointments() {
  if (!adminContainer) return;

  adminContainer.innerHTML = "<p>Cargando citas...</p>";

  try {
  const q = query(
  collection(db, "appointments"),
  orderBy("date", "asc"),
  orderBy("time", "asc")
);

const snapshot = await getDocs(q);


    if (snapshot.empty) {
      adminContainer.innerHTML = "<p>No hay citas registradas.</p>";
      return;
    }

    adminContainer.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "admin-appointment";

      div.innerHTML = `
        <p><strong>Servicio:</strong> ${data.service}</p>
        <p><strong>Barbero:</strong> ${data.barber}</p>
        <p><strong>Cliente:</strong> ${data.client}</p>
        <p><strong>Día:</strong> ${data.date}</p>
        <p><strong>Hora:</strong> ${data.time}</p>
        <hr>
      `;

      adminContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando citas:", error);
    adminContainer.innerHTML = "<p>Error al cargar las citas.</p>";
  }
}

// 🔥 Cargar citas al abrir la página
loadAdminAppointments();
