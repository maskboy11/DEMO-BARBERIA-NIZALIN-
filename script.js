// ======================================
// Utilidades
// ======================================

// Scroll suave al hacer clic en botones con data-scroll-target
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-scroll-target]");
  if (!target) return;
  const selector = target.getAttribute("data-scroll-target");
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
});

// Año dinámico en el footer
const footerYearEl = document.getElementById("footer-year");
if (footerYearEl) {
  footerYearEl.textContent = new Date().getFullYear();
}

// ======================================
// Reserva: estado de la selección
// ======================================

const state = {
  services: [],
  barbers: [],
  selectedService: null,
  selectedBarberId: null,
  selectedDate: null,
  selectedHour: null,
};

// Elementos del DOM
const servicesContainer = document.getElementById("services-container");
const barbersContainer = document.getElementById("barbers-container");
const hoursContainer = document.getElementById("hours-container");

const dateInput = document.getElementById("booking-date");

const summaryService = document.getElementById("summary-service");
const summaryBarber = document.getElementById("summary-barber");
const summaryDate = document.getElementById("summary-date");
const summaryHour = document.getElementById("summary-hour");

const confirmButton = document.getElementById("confirm-booking");
const feedbackEl = document.getElementById("booking-feedback");

// ======================================
// Carga de data.json
// ======================================

async function loadData() {
  try {
    const res = await fetch("data.json");
    const data = await res.json();
    state.services = data.services || [];
    state.barbers = data.barbers || [];
    renderServices();
    renderBarbers();
    renderHoursMessagePlaceholder();
  } catch (error) {
    console.error("Error cargando data.json", error);
    if (feedbackEl) {
      feedbackEl.textContent = "No se han podido cargar los servicios y barberos.";
    }
  }
}

// ======================================
// Render: Servicios
// ======================================

function renderServices() {
  if (!servicesContainer) return;
  servicesContainer.innerHTML = "";

  state.services.forEach((service) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "booking-option";
    button.textContent = service.name;

    button.addEventListener("click", () => {
      state.selectedService = service.name;
      updateActiveService(button);
      updateSummary();
    });

    servicesContainer.appendChild(button);
  });
}

function updateActiveService(activeButton) {
  const allButtons = servicesContainer.querySelectorAll(".booking-option");
  allButtons.forEach((btn) => btn.classList.remove("booking-option--active"));
  if (activeButton) {
    activeButton.classList.add("booking-option--active");
  }
}

// ======================================
// Render: Barberos
// ======================================

function renderBarbers() {
  if (!barbersContainer) return;
  barbersContainer.innerHTML = "";

  state.barbers.forEach((barber) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "booking-option";

    const card = document.createElement("div");
    card.className = "barber-card";

    const avatar = document.createElement("div");
    avatar.className = "barber-card__avatar";

    const img = document.createElement("img");
    img.src = barber.image;
    img.alt = `Barbero ${barber.name}`;
    avatar.appendChild(img);

    const info = document.createElement("div");
    info.className = "barber-card__info";

    const nameEl = document.createElement("p");
    nameEl.className = "barber-card__name";
    nameEl.textContent = barber.name;

    const taglineEl = document.createElement("p");
    taglineEl.className = "barber-card__tagline";
    taglineEl.textContent = barber.tagline || "Especialista en cortes y fades";

    info.appendChild(nameEl);
    info.appendChild(taglineEl);

    card.appendChild(avatar);
    card.appendChild(info);
    button.appendChild(card);

    button.addEventListener("click", () => {
      state.selectedBarberId = barber.id;
      state.selectedHour = null; // limpiar hora si cambia barbero
      updateActiveBarber(button);
      renderHoursForBarber(barber);
      updateSummary();
    });

    barbersContainer.appendChild(button);
  });
}

function updateActiveBarber(activeButton) {
  const allButtons = barbersContainer.querySelectorAll(".booking-option");
  allButtons.forEach((btn) => btn.classList.remove("booking-option--active"));
  if (activeButton) {
    activeButton.classList.add("booking-option--active");
  }
}

// ======================================
// Render: Horas
// ======================================

function renderHoursMessagePlaceholder() {
  if (!hoursContainer) return;
  hoursContainer.innerHTML = "";
  const message = document.createElement("p");
  message.className = "booking-step__subtitle";
  message.textContent = "Selecciona primero un barbero para ver sus horarios.";
  hoursContainer.appendChild(message);
}

function renderHoursForBarber(barber) {
  if (!hoursContainer) return;
  hoursContainer.innerHTML = "";

  if (!barber || !Array.isArray(barber.hours) || barber.hours.length === 0) {
    const message = document.createElement("p");
    message.className = "booking-step__subtitle";
    message.textContent = "No hay horarios configurados para este barbero.";
    hoursContainer.appendChild(message);
    return;
  }

  barber.hours.forEach((hour) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "booking-option hour-button";
    btn.textContent = hour;

    btn.addEventListener("click", () => {
      state.selectedHour = hour;
      updateActiveHour(btn);
      updateSummary();
    });

    hoursContainer.appendChild(btn);
  });
}

function updateActiveHour(activeButton) {
  const allButtons = hoursContainer.querySelectorAll(".booking-option");
  allButtons.forEach((btn) => btn.classList.remove("booking-option--active"));
  if (activeButton) {
    activeButton.classList.add("booking-option--active");
  }
}

// ======================================
// Date input
// ======================================

if (dateInput) {
  // Fecha mínima = hoy
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  dateInput.addEventListener("change", () => {
    state.selectedDate = dateInput.value || null;
    updateSummary();
  });
}

// ======================================
// Resumen
// ======================================

function updateSummary() {
  if (summaryService) {
    summaryService.textContent = state.selectedService || "Sin seleccionar";
  }

  if (summaryBarber) {
    const barber = state.barbers.find((b) => b.id === state.selectedBarberId);
    summaryBarber.textContent = barber ? barber.name : "Sin seleccionar";
  }

  if (summaryDate) {
    if (!state.selectedDate) {
      summaryDate.textContent = "Sin seleccionar";
    } else {
      const date = new Date(state.selectedDate);
      if (!isNaN(date.getTime())) {
        summaryDate.textContent = date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } else {
        summaryDate.textContent = "Sin seleccionar";
      }
    }
  }

  if (summaryHour) {
    summaryHour.textContent = state.selectedHour || "Sin seleccionar";
  }
}

// ======================================
// Confirmación simulada
// ======================================

if (confirmButton) {
  confirmButton.addEventListener("click", () => {
    if (!feedbackEl) return;

    if (!state.selectedService || !state.selectedBarberId || !state.selectedDate || !state.selectedHour) {
      feedbackEl.textContent = "Completa los 4 pasos para confirmar tu reserva.";
      feedbackEl.style.color = "#f97373";
      return;
    }

    const barber = state.barbers.find((b) => b.id === state.selectedBarberId);
    const barberName = barber ? barber.name : "";

    feedbackEl.style.color = "#4ade80";
    feedbackEl.textContent = `Reserva simulada para "${state.selectedService}" con ${barberName} el ${summaryDate.textContent} a las ${state.selectedHour}.`;
  });
}

// ======================================
// Inicialización
// ======================================

loadData();
