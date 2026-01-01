console.log("SCRIPT CARGADO");

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

// CONTENEDORES
const servicesContainer = document.querySelector(".js-services");
const barbersContainer = document.querySelector(".js-barbers");
const hoursContainer = document.querySelector(".js-hours");

// RESUMEN
const summaryService = document.getElementById("summary-service");
const summaryBarber = document.getElementById("summary-barber");
const summaryDate = document.getElementById("summary-date");
const summaryHour = document.getElementById("summary-hour");

// HELPERS
function clearActive(container) {
  [...container.children].forEach(el => el.classList.remove("active"));
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

// HORAS
function renderHours() {
  hoursContainer.innerHTML = "";

  if (!selectedService || !selectedBarber || !selectedDate) return;

  hours.forEach(hour => {
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

// CONFIRMAR
document.getElementById("confirm").onclick = () => {
  if (!selectedService || !selectedBarber || !selectedDate || !selectedHour) {
    alert("Completa todos los pasos");
    return;
  }

  alert(`
Reserva confirmada (simulada):
${selectedService.name}
${selectedBarber.name}
${selectedDate} a las ${selectedHour}
`);
};
