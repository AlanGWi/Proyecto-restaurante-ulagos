


<template>
  <div>
      <HederViewVue></HederViewVue>

  

    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">

      

      <div class="card shadow p-4" style="width: 100%; max-width: 500px;">

                 <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/reservas">reservas</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/EditarReservas">Mi reserva</a>
  </li>
  <li class="nav-item">
    <a v-if="rol === 'ADMIN' || rol === 'TRABAJADOR'" class="nav-link" href="/verReservas">Ver todos</a>
  </li>
  
</ul>
        <h2 class="mb-4 text-center">Reservar Mesa</h2>
        <form @submit.prevent="crearReserva">
          <div class="mb-3">
            <label for="correo" class="form-label">Correo</label>
            <input v-model="reserva.correo" type="email" class="form-control" id="correo" required />
          </div>

          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre del Cliente</label>
            <input v-model="reserva.nombre" type="text" class="form-control" id="nombre" />
          </div>

          <div class="mb-3">
            <label for="numero_personas" class="form-label">Número de Personas</label>
            <input v-model.number="reserva.numero_personas" type="number" class="form-control" id="numero_personas" min="1" required />
          </div>

        <div class="mb-3">
  <label for="fecha_inicio" class="form-label">Fecha y hora de inicio</label>
  <flat-pickr
    v-model="reserva.fecha_inicio"
    
    type="datetime-local"
    class="form-control"
    id="fecha_inicio"

    :config="{
       minDate: 'today',
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      altInput: true,
      altFormat: 'd-m-Y H:i',
      minTime: '08:00',
      maxTime: '21:00',
      minuteIncrement: 30
    }"
     
    required
  />
</div>



          <div class="mb-3">
            <label for="duracion" class="form-label">Duración estimada (en horas)</label>
            <input v-model.number="reserva.duracion" type="number" class="form-control" id="duracion" min="1" required />
          </div>

          <!-- Fecha de fin se calcula automáticamente -->
          <!-- Fecha de fin -->
<div class="mb-3">
  <label for="fecha_fin" class="form-label">Fecha y hora de fin</label>
  <flat-pickr
    :model-value="fechaFin"
    disabled
    class="form-control"
    id="fecha_fin"
    :config="{
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      altInput: true,
      altFormat: 'd-m-Y H:i'
    }"
  />
</div>
          <div class="mb-3">
          <label for="mesa" class="form-label">Seleccionar Mesa</label>
          <select v-model="reserva.mesa" id="mesa" class="form-select" required>
            <option disabled value="">Seleccione una mesa</option>
            <option v-for="mesa in mesas" :key="mesa._id" :value="mesa._id">
              Mesa {{ mesa.numero }} - {{ mesa.zona }} - capacidad {{  mesa.capacidad }}
            </option>
          </select>
        </div>

          <button type="submit" class="btn btn-primary w-100">Crear Reserva</button>
        </form>

        <div v-if="mensaje" class="alert alert-success mt-3">{{ mensaje }}</div>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';
import flatPickr from 'vue-flatpickr-component';
import flatpickr from 'flatpickr'; // ojo, este es el core
import { Spanish } from 'flatpickr/dist/l10n/es.js'; // idioma
import 'flatpickr/dist/flatpickr.css';


// Cambiar idioma global
flatpickr.localize(Spanish);



export default {
  components: { HederViewVue ,flatPickr},
  name: 'ReservaForm',
  data() {
    return {
      reserva: {
        correo: '',
        nombre: '',
        numero_personas: 1,
        fecha_inicio: '',
        fecha_fin: '',
        duracion: 1, // Establecer una duración por defecto
        mesa: '', // Nuevo campo para guardar el ID de la mesa
      },
       mesas: [],
      mensaje: '',
      error: '',
      rol: localStorage.getItem('role'),
    };
  },
  mounted() {
  this.obtenerMesas();
},

  computed: {
    fechaFin() {
      // Calcular la fecha de fin sumando la duración a la fecha de inicio
      if (this.reserva.fecha_inicio && this.reserva.duracion) {
        const fechaInicio = new Date(this.reserva.fecha_inicio);
        fechaInicio.setHours(fechaInicio.getHours()-4 + this.reserva.duracion);
        return fechaInicio.toISOString().slice(0, 16); // Retornar en formato 'YYYY-MM-DDTHH:mm'
      }
      return ''; // Si no hay fecha de inicio, retornar vacío
    },  
  },
    

  methods: {

    async obtenerMesas() {
    try {
      const res = await axios.get('http://localhost:3000/api/mesas');
      this.mesas = res.data;
      this.mesas = res.data.filter(mesa => mesa.activa === true);
      console.log(this.mesas)
    } catch (error) {
      console.error('Error al obtener mesas:', error);
    }
  },
    async crearReserva() {
      this.mensaje = '';
      this.error = '';

      try {
        // Obtener el token desde localStorage
        const token = localStorage.getItem('token');

  // Convertir fecha_inicio a objeto Date y restarle 4 horas java coloca 4 horas
const fechaInicio = new Date(new Date(this.reserva.fecha_inicio).getTime());

// Calcular fechaFin sumando la duración y restando también 4 horas
const fechaFin = new Date(fechaInicio.getTime() + this.reserva.duracion * 60 * 60 * 1000);
console.log(fechaInicio)

        // Inyectar el token en el cuerpo de la solicitud (como haces en tus otros métodos)
        const reservaConToken = {
          ...this.reserva,
          
          fechaInicio:fechaFin.toISOString(),
          fecha_fin: fechaFin.toISOString(), // Se envía al backend
          token: token,
        };

        const response = await axios.post(
          'http://localhost:3000/api/reserva/reservas',
          reservaConToken
        );

        this.mensaje = `Reserva creada con éxito. Código: ${response.data.codigo_reserva}`;
        this.reserva = {
          correo: '',
          nombre: '',
          numero_personas: 1,
          fecha_inicio: '',
          fecha_fin: '',
        };
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al crear la reserva';
      }
    },
  },
};
</script>
  <style >
  
  </style>