// Año dinámico en el footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Menú móvil
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });

  // Cerrar menú al hacer clic en un enlace
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('is-open'));
  });
}

// Animaciones suaves al hacer scroll usando IntersectionObserver
const animatedElements = document.querySelectorAll(
  '.service-card, .why-card, .gallery-item, .review-card, .contact-info, .contact-map, .booking-form, .booking-sidebar'
);

animatedElements.forEach(el => {
  el.setAttribute('data-animate', 'fade-up');
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

animatedElements.forEach(el => observer.observe(el));

// -------------------------
// Sistema simple de barberos/horarios
// -------------------------

// Definición básica de horarios por barbero (orientativos)
const barberSchedules = {
  'Nizalin (jefe)': [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '16:30', '17:00', '17:30', '18:00',
    '18:30', '19:00', '19:30', '20:00'
  ],
  'Carlos': [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00',
    '16:30', '17:00', '17:30', '18:00',
    '18:30', '19:00', '19:30'
  ],
  'Mario': [
    '11:00', '11:30', '12:00', '12:30',
    '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00'
  ]
};

const barberSelect = document.getElementById('barber');
const timeSelect = document.getElementById('time');
const bookingForm = document.getElementById('booking-form');

function fillTimeOptions(barber) {
  // Limpia opciones actuales
  timeSelect.innerHTML = '';

  if (!barber || !barberSchedules[barber]) {
    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.selected = true;
    option.textContent = 'Elige primero un barbero';
    timeSelect.appendChild(option);
    return;
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = 'Selecciona una hora disponible';
  timeSelect.appendChild(defaultOption);

  barberSchedules[barber].forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });
}

// Actualizar horas cuando cambia el barbero
if (barberSelect && timeSelect) {
  barberSelect.addEventListener('change', e => {
    fillTimeOptions(e.target.value);
  });
}

// Envío del formulario por WhatsApp
if (bookingForm) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();

    const barber = barberSelect.value;
    const date = document.getElementById('date').value;
    const time = timeSelect.value;
    const service = document.getElementById('service').value;
    const name = document.getElementById('name').value.trim();

    if (!barber || !date || !time || !service) {
      alert('Por favor, completa barbero, día, horario y servicio antes de enviar.');
      return;
    }

    // Formatear fecha a dd/mm/aaaa para verlo claro en WhatsApp
    const formattedDate = (() => {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return date;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    })();

    const encodedName = name || 'Sin nombre indicado';

    const message =
      `Hola, quiero pedir cita en Barbería Nizalin:%0A` +
      `• Nombre: ${encodeURIComponent(encodedName)}%0A` +
      `• Barbero: ${encodeURIComponent(barber)}%0A` +
      `• Día: ${encodeURIComponent(formattedDate)}%0A` +
      `• Hora: ${encodeURIComponent(time)}%0A` +
      `• Servicio: ${encodeURIComponent(service)}%0A%0A` +
      `¿Hay disponibilidad para esta hora?`;

    const phone = '34910279675';
    const whatsappURL = `https://wa.me/${phone}?text=${message}`;

    window.open(whatsappURL, '_blank');
  });
}
