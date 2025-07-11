<template>
  <div>
    <HederViewVue></HederViewVue>

    <div class="container py-5">
      <div class="card shadow p-4 mx-auto" style="max-width: 600px;">

                     <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/reservas">reservas</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/EditarReservas">Mi reserva</a>
  </li>
    <li class="nav-item">
    <a v-if="rols === 'ADMIN' || rols === 'TRABAJADOR'" class="nav-link" href="/verReservas">Ver todos</a>
  </li>
</ul>
 
        <h2 class="text-center mb-4">Modificar Reserva</h2>

        <form @submit.prevent="buscarReserva">
          <div class="input-group mb-3">
            <input
              v-model="codigoBusqueda"
              type="text"
              class="form-control"
              placeholder="Código de reserva"
              required
            />
            <button class="btn btn-secondary" type="submit">Buscar</button>
          </div>
        </form>

        <form v-if="reserva._id" @submit.prevent="actualizarReserva">
          <div class="mb-3">
            <label class="form-label">Correo</label>
            <input v-model="reserva.correo" type="email" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input v-model="reserva.nombre" type="text" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Número de personas</label>
            <input v-model.number="reserva.numero_personas" type="number" class="form-control" min="1" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select v-model="reserva.estado" class="form-select">
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              
            </select>
          </div>

          <!-- Fecha y hora de inicio -->
<div class="mb-3">
  <label class="form-label">Fecha y hora de inicio</label>
  <flat-pickr
    v-model="reserva.fecha_inicio"
    class="form-control"
    :config="{
      enableTime: true,           //  Habilita hora
      time_24hr: true,            //  Formato 24h
      dateFormat: 'Y-m-d H:i',    //  Formato para guardar (2025-06-28 14:30)
      altInput: true,
      altFormat: 'd-m-Y H:i',     //  Formato visible (28-06-2025 14:30)
      minDate: 'today'
    }"
    required
  />
</div>

<!-- Fecha y hora de fin -->
<div class="mb-3">
  <label class="form-label">Fecha y hora de fin</label>
  <flat-pickr
    v-model="reserva.fecha_fin"
    class="form-control"
    :config="{
      enableTime: true,
      time_24hr: true,
      dateFormat: 'Y-m-d H:i',
      altInput: true,
      altFormat: 'd-m-Y H:i',
      minDate: reserva.fecha_inicio || 'today'
    }"
    required
  />
</div>

          <div class="mb-3">
  <label class="form-label">Mesa</label>
  <select v-model="reserva.mesa" class="form-select" required>
    <option disabled value="">Selecciona una mesa</option>
    <option v-for="mesa in mesas" :key="mesa._id" :value="mesa._id">
      Mesa {{ mesa.numero }} - Zona {{ mesa.zona }} (Capacidad: {{ mesa.capacidad }})
    </option>
  </select>
</div>


          <button type="submit" class="btn btn-primary w-100">Actualizar Reserva</button>
        </form>

        <div v-if="mensaje" class="alert alert-success mt-3">{{ mensaje }}</div>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import HederViewVue from '@/components/HederView.vue';


export default {
  name: 'EditarReserva',
  components: { flatPickr, HederViewVue },
  data() {
    return {
    token: localStorage.getItem("token"),
      codigoBusqueda: '',
      reserva: {},
      mensaje: '',
      error: '',
      fpConfig: {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        minTime: '08:00',
        maxTime: '21:00',
        minuteIncrement: 30
      },
      mesas:[],
      rols: "",
       
    };
  },
    mounted() {
    this.obtenerMesas();
    this.rols = localStorage.getItem("role");
  },
  methods: {

    formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
      async obtenerMesas() {
    try {
      const res = await axios.get('http://localhost:3000/api/mesas');
      this.mesas = res.data;
      this.mesas = res.data.filter(mesa => mesa.activa === true);
      console.log(this.mesas)
    } catch (error) {
      console.error('Error al obtener mesas:', error);
    }},
    async buscarReserva() {
      this.mensaje = '';
      this.error = '';
      try {
        const res = await axios.get(`http://localhost:3000/api/reserva/buscar-codigo/${this.codigoBusqueda}`,{
            headers: { "Access-Control-Allow-Origin": "*" },
            params: { token: this.token }
        });
        this.reserva = res.data;
        console.log(this.reserva)
      } catch (err) {
        this.error = err.response?.data?.error || 'No se encontró la reserva.';
        this.reserva = {};
      }
    },
    async actualizarReserva() {
      this.mensaje = '';
      this.error = '';
      try {
        
        await axios.put(`http://localhost:3000/api/reserva/reservas/${this.reserva._id}`, this.reserva, {
          headers: { "Access-Control-Allow-Origin": "*" },
            params: { token: this.token }
        });
        this.mensaje = 'Reserva actualizada correctamente.';
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al actualizar la reserva';
      }
    }
  }
};
</script>