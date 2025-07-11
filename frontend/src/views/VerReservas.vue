<template>
  <div class="container mt-4">
    <h2 class="mb-4">Listado de Reservas</h2>

                       <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/reservas">reservas</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/EditarReservas">Mi reserva</a>
  </li>
    <li class="nav-item">
    <a class="nav-link" href="/verReservas">Ver todos</a>
  </li>
</ul>


    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Código de Reserva</th>
          <th>estado</th>
          <th>Fecha</th>
          <th>Mesa</th>
          <th>accion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(reserva, index) in reservas" :key="reserva._id">
          <td>{{ index + 1 }}</td>
          <td>{{ reserva.nombre }}</td>
          <td>{{ reserva.correo }}</td>
          <td>{{ reserva.codigo_reserva }}</td>
          <td>{{ reserva.estado }}</td>
          <td>{{ formatearFecha(reserva.fecha_inicio) }}</td>
          <td>{{ reserva.mesa?.numero || 'N/A' }}</td>

          <td>
  <select v-model="reserva.estado" @change="actualizarReserva(reserva)" class="form-select form-select-sm">
    <option value="pendiente">Pendiente</option>
    <option value="confirmada">Confirmada</option>
    <option value="cancelada">Cancelada</option>
  </select>
</td>

           <button class="btn btn-danger btn-sm" @click="eliminarReserva(reserva._id)">
          Eliminar
        </button>
        </tr>
      </tbody>
    </table>

    <div v-if="reservas.length === 0" class="alert alert-info mt-3">
      No hay reservas registradas.
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ListadoReservas',
  data() {
    return {
      reservas: [],
      token: localStorage.getItem('token') || '',
    }
  },
  methods: {
   cargarReservas() {
  console.log(this.token);
  axios
    .get('http://localhost:3000/api/reserva/todaslasreservas', {
      params: {
        token: this.token
      }
    })
    .then(response => {
      this.reservas = response.data;
      console.log( response.data);
    })
    .catch(error => {
      console.error('Error al cargar las reservas:', error);
    });
},

eliminarReserva(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) return;

  axios
    .delete(`http://localhost:3000/api/reserva/reservas/${id}`, {
       params: {
        token: this.token
      }
    })
    .then(() => {
      this.reservas = this.reservas.filter(reserva => reserva._id !== id);
      alert('Reserva eliminada correctamente.');
    })
    .catch(error => {
      console.error('Error al eliminar la reserva:', error);
      alert('Error al eliminar la reserva.');
    });
},
    formatearFecha(fechaISO) {
      const fecha = new Date(fechaISO)
      return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString()
    },


  actualizarReserva(reserva) {
  try {
    axios.put(
      `http://localhost:3000/api/reserva/reservas/${reserva._id}`,
      { estado: reserva.estado },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
        params: { token: this.token }
      }
    );
    alert('Estado de reserva actualizado correctamente.');
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || 'Error al actualizar el estado de la reserva');
  }
}
  },
  mounted() {
    this.cargarReservas()
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>