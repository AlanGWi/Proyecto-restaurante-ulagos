<template>
      <HederViewVue />
  <div class="container my-4">
    <h2 class="mb-3">Crear anuncio</h2>
    <form @submit.prevent="enviarAnuncio">
      <div class="mb-3">
        <label class="form-label">Mensaje</label>
        <input v-model="anuncio.mensaje" type="text" class="form-control" required />
      </div>

     <!-- Fecha de inicio -->
<div class="mb-3">
  <label class="form-label">Fecha de inicio</label>
  <flat-pickr
    v-model="anuncio.fecha_inicio"
    class="form-control"
    :config="{
     
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd-m-Y',
      minDate: 'today'
    }"
    required
  />
</div>

<!-- Fecha de fin -->
<div class="mb-3">
  <label class="form-label">Fecha de fin</label>
  <flat-pickr
    v-model="anuncio.fecha_fin"
    
    class="form-control"
    :config="{
      
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd-m-Y',
      minDate: anuncio.fecha_inicio || 'today'
    }"
    required
  />
</div>

      <div class="mb-3 form-check">
        <input v-model="anuncio.visible" type="checkbox" class="form-check-input" id="visibleCheck" />
        <label class="form-check-label" for="visibleCheck">Visible</label>
      </div>

      <div class="mb-3">
        <label class="form-label">Imagen</label>
        <input @change="handleImagen" type="file" class="form-control" accept="image/*" required />
      </div>

      <button type="submit" class="btn btn-primary">Guardar anuncio</button>
    </form>
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
  data() {
    return {
      anuncio: {
        mensaje: '',
        fecha_inicio: '',
        fecha_fin: '',
        visible: true,
        imagen: null,
      },
    };
  },
  components: {
    HederViewVue,flatPickr
  },
  methods: {
    handleImagen(e) {
      this.anuncio.imagen = e.target.files[0];
    },
    async enviarAnuncio() {
      try {
        const formData = new FormData();
        formData.append('mensaje', this.anuncio.mensaje);
        formData.append('fecha_inicio', this.anuncio.fecha_inicio);
        formData.append('fecha_fin', this.anuncio.fecha_fin);
        formData.append('visible', this.anuncio.visible);
        formData.append('imagen', this.anuncio.imagen);

        await axios.post('http://localhost:3000/api/anuncios/crear', formData);

        alert('Anuncio creado correctamente');
        this.resetFormulario();
      } catch (error) {
        console.error(error);
        const mensaje =  error.response?.data?.error;
    alert(mensaje);
      }
    },
    resetFormulario() {
      this.anuncio = {
        mensaje: '',
        fecha_inicio: '',
        fecha_fin: '',
        visible: true,
        imagen: null,
      };
      // También puedes reiniciar el input de tipo file si lo deseas
    },
  },
};
</script>
