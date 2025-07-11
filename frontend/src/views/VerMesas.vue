<template>

      <HederViewVue></HederViewVue>
  <div class="container py-4">

  <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/mesas">Mesas</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/vermesas">Ver mesas</a>
  </li>
  
</ul>

    <h2 class="text-center mb-4">Mesas del Restaurante</h2>

    <!-- Botones para filtrar -->
    <div class="text-center mb-3">
      <button class="btn btn-outline-primary mx-2" @click="zonaSeleccionada = 'interior'">Interior</button>
      <button class="btn btn-outline-success mx-2" @click="zonaSeleccionada = 'terraza'">Terraza</button>
      <button class="btn btn-outline-warning mx-2" @click="zonaSeleccionada = 'vip'">VIP</button>
    </div>

    <!-- Mostrar mesas filtradas -->
    <div class="row justify-content-center">
      <div
        v-for="mesa in mesasFiltradas"
        :key="mesa._id"
        class="mesa-card m-2 d-flex flex-column align-items-center justify-content-center"
      >
        <div><strong>Mesa {{ mesa.numero }}</strong></div>
        <div>{{ mesa.capacidad }} personas</div>
        <div :class="mesa.activa ? 'text-success' : 'text-danger'">
          {{ mesa.activa ? 'Activa' : 'Inactiva' }}
        </div>
           <div class="d-flex gap-1 mt-2">
          <button class="btn btn-warning btn-sm" @click="abrirModalEditar(mesa)">Editar</button>
          <button class="btn btn-sm btn-danger" @click="eliminarMesa(mesa._id)">eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal para editar mesa -->
<div class="modal fade" id="editarMesaModal" tabindex="-1" aria-labelledby="editarMesaLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form @submit.prevent="actualizarMesa">
        <div class="modal-header">
          <h5 class="modal-title" id="editarMesaLabel">Editar Mesa</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Número</label>
            <input type="number" class="form-control" v-model="mesaEditada.numero" required :min="1" />
          </div>
          <div class="mb-3">
            <label class="form-label">Capacidad</label>
            <input type="number" class="form-control" v-model="mesaEditada.capacidad" required :min="1" />
          </div>
          <div class="mb-3">
            <label class="form-label">Zona</label>
            <select class="form-control" v-model="mesaEditada.zona">
              <option value="interior">Interior</option>
              
              <option value="terraza">Terraza</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="mesaEditada.activa" />
            <label class="form-check-label">Activa</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </div>
      </form>
    </div>
  </div>
</div>

  </div>
</template>


<script>
import axios from 'axios';
import { Modal } from 'bootstrap';
import HederViewVue from '@/components/HederView.vue';



export default {
     components: { HederViewVue },
  data() {
    
    return {
      mesas: [],
      zonaSeleccionada: 'interior',
      token: localStorage.getItem('token') || '',

      mesaEditada: {
      _id: '',
      numero: 0,
      capacidad: 0,
      zona: 'interior',
      activa: true
    }
    };
  },
  computed: {
    mesasFiltradas() {
      return this.mesas.filter(mesa => mesa.zona === this.zonaSeleccionada);
    }
  },
  mounted() {
    this.obtenerMesas();
  },
  methods: {
    async obtenerMesas() {
      try {
        const res = await axios.get('http://localhost:3000/api/mesas');
        this.mesas = res.data;
      } catch (error) {
        console.error('Error al obtener mesas:', error);
        alert("Ocurrió un error: " + (error.response?.data?.message || error.message));
      }
    },

       async eliminarMesa(id) {
      if (confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
        try {
            
          await axios.delete(`http://localhost:3000/api/mesas/${id}`,{

            headers: { "Access-Control-Allow-Origin": "*" },
            params: { token: this.token }
          } );
          this.obtenerMesas(); // Refrescar lista
        } catch (error) {
          console.error('Error al eliminar la mesa:', error);
          alert("Ocurrió un error: " + (error.response?.data?.message || error.message));
        }
      }
    },

      abrirModalEditar(mesa) {

        document.querySelectorAll('.custom-modal.is-active').forEach(m => {
  m.classList.remove('is-active');
});

    this.mesaEditada = { ...mesa };
    const modal = new Modal(document.getElementById('editarMesaModal'));
    modal.show();
  },

  async actualizarMesa() {
    try {
   
      await axios.put(`http://localhost:3000/api/mesas/${this.mesaEditada._id}`, this.mesaEditada, {
       headers: { "Access-Control-Allow-Origin": "*" },
            params: { token: this.token }
      });
      this.obtenerMesas();
      const modal = Modal.getInstance(document.getElementById('editarMesaModal'));
      modal.hide();
    } catch (error) {
      console.error('Error al actualizar la mesa:', error);
        alert("Ocurrió un error: " + (error.response?.data?.message || error.message));
    }
  }
  }
};
</script>

<style scoped>
.mesa-card {
  width: 200px;
  height: 200px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: #f8f9fa;
  text-align: center;
  font-size: 14px;
}
</style>