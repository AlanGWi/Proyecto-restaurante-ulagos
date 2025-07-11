<template>
    <HederViewVue></HederViewVue>
  <div class="container mt-5">

  <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/mesas">Mesas</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/vermesas">Ver mesas</a>
  </li>
  
</ul>

    <h2>Crear Mesas por Zona</h2>
    <form @submit.prevent="crearMesas">
      <div class="mb-3">
        <label for="zona" class="form-label">Zona</label>
        <select v-model="formulario.zona" class="form-control" id="zona">
          <option value="interior">Interior</option>
          <option value="terraza">Terraza</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div class="mb-3">
        <label for="capacidad" class="form-label">Capacidad de cada mesa</label>
        <input v-model.number="formulario.capacidad" type="number" class="form-control" required :min="1" />
      </div>

      <div class="mb-3">
        <label for="cantidad" class="form-label">Cantidad de mesas</label>
        <input v-model.number="formulario.cantidad" type="number" class="form-control" required :min="1" />
      </div>

      <button type="submit" class="btn btn-success">Crear Mesas</button>

      <div v-if="mensaje" class="alert alert-success mt-3">{{ mensaje }}</div>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';

export default {
    components: { HederViewVue },
  name: 'MesaLoteForm',
  data() {
    return {
      formulario: {
        zona: 'interior',
        capacidad: 4,
        cantidad: 1
      },
      mensaje: '',
      error: ''
    };
  },
  methods: {
    async crearMesas() {
      this.mensaje = '';
      this.error = '';

      try {
        const token = localStorage.getItem("token");

        // Obtener el último número de mesa desde el backend (opcional)
        const { data: mesasActuales } = await axios.get('http://localhost:3000/api/mesas', {
          headers: { "x-access-token": token }
        });
        let numeroBase = mesasActuales.length + 1;

        // Crear lote de mesas
        const nuevasMesas = Array.from({ length: this.formulario.cantidad }, (_, i) => ({
          numero: numeroBase + i,
          capacidad: this.formulario.capacidad,
          zona: this.formulario.zona
        }));

        await axios.post("http://localhost:3000/api/mesas/lote", nuevasMesas, {
          headers: { "x-access-token": token }
        });

        this.mensaje = `${this.formulario.cantidad} mesas creadas correctamente en zona ${this.formulario.zona}.`;
        this.formulario = { zona: 'interior', capacidad: 4, cantidad: 1 };
      } catch (err) {
        this.error = err.response?.data?.error || "Error al crear las mesas.";
      }
    }
  }
};
</script>