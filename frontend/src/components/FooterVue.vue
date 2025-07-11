<template>
  <footer class="bg-dark text-center text-white">
    <div class="container p-4">
      <!-- Botón para abrir el modal -->
      <section class="mb-4">
        <button
          class="btn btn-outline-light"
          data-bs-toggle="modal"
          data-bs-target="#modalComentario"
        >
          Dejar un comentario
        </button>
      </section>

      <!-- Comentarios recientes -->
  <section class="mb-4 text-start">
  <h5 class="text-uppercase mb-3">Comentarios recientes</h5>
  <div class="comentario-carousel">
    <div
      v-for="c in comentarios"
      :key="c._id"
      class="card me-3 bg-secondary text-white comentario-card"
    >
      <div class="card-body">
        <h6 class="card-title mb-1">{{ c.usuario || 'Anónimo' }}</h6>
        <p class="card-subtitle mb-2 text-warning">
  <span v-for="n in 5" :key="n">
    <i :class="n <= c.estrellas ? 'fas fa-star' : 'far fa-star'"></i>
  </span>
</p>
        <p class="card-text">{{ c.comentario }}</p>
      </div>
     <div v-if="c.token === comentarioToken" class="mt-2 d-flex justify-content-end gap-2">
  <button class="btn btn-sm btn-warning" @click="abrirEdicion(c)">editar</button>
  <button class="btn btn-sm btn-danger" @click="eliminarComentario(c._id)">eliminar</button>
</div>
    </div>
  </div>
</section>

      <!-- Redes sociales -->
      <section class="mb-4">
        <a class="btn btn-outline-light btn-floating m-1" href="#"><i class="fab fa-facebook-f"></i></a>
        <a class="btn btn-outline-light btn-floating m-1" href="#"><i class="fab fa-google"></i></a>
        <a class="btn btn-outline-light btn-floating m-1" href="#"><i class="fab fa-instagram"></i></a>
      </section>

      <!-- Información de contacto -->
      <section>
        <div class="container text-center text-md-start mt-5">
          <div class="row mt-3">
            <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 class="text-uppercase fw-bold mb-4"><i class="fas fa-gem me-3"></i>Company name</h6>
              <p>Descripción breve o mensaje institucional.</p>
            </div>
            <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 class="text-uppercase fw-bold mb-4">Contacto</h6>
              <p><i class="fas fa-home me-3"></i> New York, NY 10012, US</p>
              <p><i class="fas fa-envelope me-3"></i> info@example.com</p>
              <p><i class="fas fa-phone me-3"></i> + 01 234 567 88</p>
              <p><i class="fas fa-print me-3"></i> + 01 234 567 89</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Copyright -->
    <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2)">
      © 2023 Copyright:
      <a class="text-white" href="/login">ulagos</a>
    </div>

    <!-- Modal -->
    <div
      class="modal fade"
      id="modalComentario"
      tabindex="-1"
      aria-labelledby="modalComentarioLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content text-dark">
          <div class="modal-header">
            <h5 class="modal-title" id="modalComentarioLabel">Dejar comentario</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <input
              v-model="nuevo.usuario"
              type="text"
              class="form-control mb-2"
              placeholder="Tu nombre (opcional)"
            />
            <textarea
              v-model="nuevo.comentario"
              class="form-control mb-2"
              rows="3"
              placeholder="Tu comentario"
            ></textarea>
            <select class="form-select mb-2" v-model="nuevo.estrellas">
              <option disabled value="">Selecciona estrellas</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }} </option>
            </select>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="agregarComentario"
              data-bs-dismiss="modal"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Modal para editar comentario -->
<div
  class="modal fade"
  id="modalEditar"
  tabindex="-1"
  aria-labelledby="modalEditarLabel"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content text-dark">
      <div class="modal-header">
        <h5 class="modal-title" id="modalEditarLabel">Editar comentario</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input v-model="editar.usuario" class="form-control mb-2" />
        <textarea v-model="editar.comentario" class="form-control mb-2" rows="3"></textarea>
        <select v-model="editar.estrellas" class="form-select mb-2">
          <option disabled value="">Selecciona estrellas</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }} </option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" @click="guardarEdicion" data-bs-dismiss="modal">Guardar</button>
      </div>
    </div>
  </div>
</div>

    
  </footer>
</template>

<script>
import axios from 'axios';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

export default {
  data() {
    return {
      nuevo: {
        usuario: '',
        comentario: '',
        estrellas: '',
         comentarioToken: '',

      },
      editar: {
      _id: '',
      usuario: '',
      comentario: '',
      estrellas: ''
    },
      comentarios: []
    };
  },
  methods: {
    async obtenerComentarios() {
      try {
        const res = await axios.get('http://localhost:3000/api/comentario/ver');
        this.comentarios = res.data.slice(0, 10);
        console.log(this.comentarios)
      } catch (err) {
        console.error(err);
      }
    },
    async agregarComentario() {
      try {
        const token = localStorage.getItem('comentarioToken')
        await axios.post('http://localhost:3000/api/comentario/crear', {...this.nuevo,
          token
        });
        this.nuevo = { usuario: '', comentario: '', estrellas: '' };
        
        this.obtenerComentarios();
      } catch (err) {
        console.error(err);
        const mensaje = err.response?.data?.error || 'Error al guardar comentario';
    alert(mensaje)
      }
    },
      async eliminarComentario(id) {
        const token = localStorage.getItem('comentarioToken')
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
      await axios.delete(`http://localhost:3000/api/comentario/${id}`,  {  data: { token }});
      this.obtenerComentarios();
    }
  },

  abrirEdicion(comentario) {
    this.editar = { ...comentario };
    const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
    modal.show();
  },
  async guardarEdicion() {
     try {
    await axios.put(`http://localhost:3000/api/comentario/${this.editar._id}`, this.editar);
    this.obtenerComentarios();
  } catch (error) {
    console.error('Error al guardar edición:', error);
    // Extrae mensaje del backend si existe
    const mensaje = error.response?.data?.error || 'Error al guardar comentario';
    alert(mensaje);
  }
  },

  },
  mounted() {
  let token = localStorage.getItem('comentarioToken');

  if (!token) {
    if (crypto && crypto.randomUUID) {
      token = crypto.randomUUID();
    } else {
      // Generador simple si no hay crypto
      token = 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    localStorage.setItem('comentarioToken', token);
    console.log('Nuevo token generado:', token);
  }

  this.comentarioToken = token;
  this.obtenerComentarios();
}
};
</script>


<style scoped>
textarea,
input,
select {
  margin-bottom: 10px;
}
.comentario-carousel {
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.comentario-card {
  min-width: 250px;
  scroll-snap-align: start;
  flex-shrink: 0;
  border-radius: 10px;
}

/* Opcional: ocultar scrollbar en algunos navegadores */
.comentario-carousel::-webkit-scrollbar {
  display: none;
}
.comentario-carousel {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

