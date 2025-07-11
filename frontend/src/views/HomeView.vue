<template>
  <div>
    <HederViewVue></HederViewVue>
    
    <div class="menu-header">Menú</div>
  

    <div class="container mx-auto text-center">

         <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
    <!-- Indicadores -->
    <div class="carousel-indicators">
      <button
        v-for="(anuncio, index) in anunciosFiltrados"
        :key="'indicador-' + index"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        :data-bs-slide-to="index"
        :class="{ active: index === 0 }"
        :aria-current="index === 0 ? 'true' : undefined"
        :aria-label="`Slide ${index + 1}`"
      ></button>
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <div
        v-for="(anuncio, index) in anunciosFiltrados"
        :key="'slide-' + anuncio._id"
        class="carousel-item"
        :class="{ active: index === 0 }"
      >
        <img
          :src="`http://localhost:3000/anuncios/${anuncio.imagen}`"
          class="d-block w-100 anuncio-img"
          alt="imagen del anuncio"
        />
        <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded px-3 py-2">
          <h5 class="mb-1">{{ anuncio.mensaje }}</h5>
          <p class="mb-0">
            Vigente desde {{ formatDate(anuncio.fecha_inicio) }} hasta {{ formatDate(anuncio.fecha_fin) }}
          </p>

            <!-- Botones solo para administrador -->
  <div v-if="rols === 'ADMIN'" class="mt-2">
    <button class="btn btn-warning btn-sm me-2" @click="abrirModalEditar(anuncio)">Editar</button>
    <button class="btn btn-danger btn-sm" @click="eliminarAnuncio(anuncio._id)">Eliminar</button>
  </div>

        </div>
      </div>
    </div>

    <!-- Controles -->
    <button
      class="carousel-control-prev"
      type="button"
      data-bs-target="#carouselExampleCaptions"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Anterior</span>
    </button>
    <button
      class="carousel-control-next"
      type="button"
      data-bs-target="#carouselExampleCaptions"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Siguiente</span>
    </button>
  </div>




      <!-- Iteramos sobre las categorías únicas -->
      <div v-for="Categoria in categoriasUnicas" :key="Categoria.Categoria" class="categoria">
        <!-- Título de la categoría -->
        <h2 class="categoria-titulo">{{ Categoria.Categoria }}</h2>

        <!-- Productos dentro de la categoría -->
        <div class="row" style="padding: 20px">
          <div class="col-sm-6 col-md-4 col-lg-3" v-for="producto in ListaProducto.filter(u => u.Categoria === Categoria.Categoria)" :key="producto._id">
            <div class="producto">
              <img :src="producto.imagenUrl" class="producto-imagen" :alt="producto.nombre"   style="width: 270px; height: 200px; object-fit: cover; border-radius: 12px;">
              <h5 class="producto-nombre">{{ producto.nombre }}</h5>
              <p class="producto-descripcion">{{ producto.descripcion }}</p>
              <p class="producto-categoria">{{ producto.Categoria }}</p>
             <p class="producto-precio">{{ producto.precio.toLocaleString('es-CL') }}</p>

              <!-- Botones de acción -->
              <a class="btn btn-primary" @click="carro(producto._id); showModal = true;">Agregar al carrito</a>
             
              <a v-if="this.rols==='ADMIN'" @click="editar(producto._id)" class="btn btn-primary">editar</a>
              <a v-if="this.rols==='ADMIN'" data-bs-toggle="modal" 
                data-bs-target="#terminarPedidoModal" @click="eliminarproducto=producto._id" class="btn btn-primary">eliminar</a>
              <a v-if="this.rols==='ADMIN'" @click="deshabilitar(producto._id)" class="btn btn-primary">deshabilitar</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para eliminar producto -->
    <div class="modal fade eliminar-pedido-modal" id="terminarPedidoModal" tabindex="-1" aria-labelledby="eliminarPedidoModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="eliminarPedidoModalLabel">Eliminar producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ¿Estás seguro de que deseas eliminar este producto?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="confirmareliminar()">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar al carrito -->
    <div>
      <my-modal v-model:show="showModal" click-outside-to-close>
      <div v-if="Array.isArray(ListaProducto) && carrito.length > 0">
        <div v-for="Categoria in ListaProducto.filter(u => carrito.includes(u._id))" :key="Categoria._id">
          <p v-if="Categoria === ListaProducto.filter(u => carrito.includes(u._id)).slice(-1)[0]">
            Se agregó al carrito: {{ Categoria.nombre }} Elementos en el carrito: {{ carrito.length }}
          </p>
        </div>

        <!-- Solo se muestra el botón si hay elementos en el carrito -->
        <button class="btn btn-primary" @click="confirmarCarrito">Ir al carrito</button>
      </div>
    </my-modal>
    </div>



    <!-- Modal Editar Anuncio -->
<div class="modal fade" id="modalEditarAnuncio" tabindex="-1" aria-labelledby="modalEditarAnuncioLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content text-dark">
      <div class="modal-header">
        <h5 class="modal-title" id="modalEditarAnuncioLabel">Editar anuncio</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input required v-model="anuncioEdit.mensaje" class="form-control mb-2" placeholder="Mensaje"   >
        <flat-pickr
  v-model="anuncioEdit.fecha_inicio"
  class="form-control mb-2"
  :config="{
       utc: true,   
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'd-m-Y',
        
    minDate: 'today'
  }"
/>

<!-- Fecha de fin con Flatpickr -->
<flat-pickr
  v-model="anuncioEdit.fecha_fin"
  class="form-control mb-2"
  :config="{
       utc: true,   
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'd-m-Y',
    minDate: anuncioEdit.fecha_inicio || 'today'
  }"
/>
        <select v-model="anuncioEdit.visible" class="form-select mb-2">
          <option :value="true">Visible</option>
          <option :value="false">Oculto</option>
        </select>
        <input type="file" @change="onImageChange" class="form-control" />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" @click="guardarEdicion">Guardar</button>
      </div>
    </div>
  </div>
</div>

    <MyFooter></MyFooter>
  </div>
</template>
<script >

import HederViewVue from '@/components/HederView.vue';
import MyModal from '@/components/ModalVue.vue';
import MyFooter from '@/components/FooterVue.vue';


import axios from 'axios'
import * as bootstrap from 'bootstrap';


import flatPickr from 'vue-flatpickr-component';
import flatpickr from 'flatpickr'; // ojo, este es el core
import { Spanish } from 'flatpickr/dist/l10n/es.js'; // idioma
import 'flatpickr/dist/flatpickr.css';

// Cambiar idioma global
flatpickr.localize(Spanish);

export default{

  

name:"FormNue",
components:{
  HederViewVue,
  MyModal,
  MyFooter,
  flatPickr
},

mounted: async function () {
  // Cargar menú
  this.fetchMenuItems();

  // Cargar anuncios
  try {
    const res = await axios.get('http://localhost:3000/api/anuncios');
    this.anuncios = res.data;

    // Esperar a que Vue pinte el DOM con los anuncios antes de inicializar el carrusel
    this.$nextTick(() => {
      const el = document.querySelector('#carouselExampleCaptions');
      if (el) {
        new bootstrap.Carousel(el, {
          interval: 4000,   // Cambia cada 4 segundos
          ride: 'carousel', // Hace que empiece automáticamente
          pause: 'hover',   // Opcional: se detiene al pasar el mouse
          wrap: true        // Vuelve al inicio al llegar al final
        });
      }
    });
  } catch (err) {
    console.error('Error cargando anuncios:', err);
  }
},



data:function(){
    return { 
      ListaProducto:"",
      eliminarproducto:"",
      categoriasUnicas:"", 
      showModal: false,
      carrito: [],
      token:"",
       anuncios: [],
       anuncioEdit: {}, // Anuncio que se está editando
    nuevaImagen: null
    }
},
  computed: {
  anunciosFiltrados() {

    if (this.rols === 'ADMIN') {
    // Mostrar todos si eres admin
    return this.anuncios;
  }
    const hoy = new Date();

    const filtrados = this.anuncios.filter((a) => {
      const inicio = new Date(a.fecha_inicio);
      const fin = new Date(a.fecha_fin);
      fin.setHours(23, 59, 59, 999); // Para incluir todo el día

      return (
        a.visible &&
        inicio <= hoy &&
        fin >= hoy &&
        a.imagen
      );
    });

    console.log('Anuncios filtrados:', filtrados); // <-- Aquí lo ves
    return filtrados;
  }
    
  },
methods:{


  confirmareliminar(){
    console.log(this.eliminarproducto)
    this.eliminar(this.eliminarproducto)
    this.fetchMenuItems();
  },


  fetchMenuItems() {
    this.rols = localStorage.getItem("role");
    console.log(this.rols)

    this.token = localStorage.getItem("token");
    let direccion = "http://localhost:3000/api/menu/allMenu" ;
    axios.get(direccion).then( data =>{
      console.log(data.data);
      this.ListaProducto = data.data.filter(producto => producto.Habilitado === true);
      console.log(this.ListaProducto)

      this.categoriasUnicas = this.ListaProducto.filter(function(item, index, self) {
        return self.findIndex(function(i) {
          return i.Categoria === item.Categoria;
        }) === index;
      }).map(function(item) {
        return { Categoria: item.Categoria };
      });
      console.log(this.categoriasUnicas);
    
    });
  },
  editar(id){
 this.$router.push("/editar/"+id);
  },

  eliminar(id) {
  axios.delete(`http://localhost:3000/api/menu/${id}`, { 
    headers: { "Access-Control-Allow-Origin": "*" },
    params: { token: this.token} 
  }).then(response => {
    console.log(response.data);
    this.fetchMenuItems();
  }).catch(error => {
    console.error(error);
  });
},
carro(id) {
      this.carrito.push(id); // agregar el id al array carrito
      this.showModal = true; // Mostrar el modal después de agregar al carrito
    },
    confirmarCarrito() {
      if (this.carrito.length > 0) {
        const ids = this.carrito.join(',');
        this.$router.push("/carrito/" + ids); // pasar el array carrito como parámetro en la ruta
      }
    },
  deshabilitar(id){

  
    axios.put('http://localhost:3000/api/menu/estado/' + id, { habilitado: false })
  .then(response => {
    console.log(response);
    this.fetchMenuItems();
  })
  .catch(error => {
    console.error(error);
  });
      
  },
   formatDate(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.substring(0, 10).split('-');
  return `${d}-${m}-${y}`;
},
 abrirModalEditar(anuncio) {
  this.anuncioEdit = {
    ...anuncio,
    fecha_inicio: anuncio.fecha_inicio?.substring(0, 10) || '',
    fecha_fin: anuncio.fecha_fin?.substring(0, 10) || ''
  };

  const modal = new bootstrap.Modal(document.getElementById('modalEditarAnuncio'));
  modal.show();
},

  onImageChange(e) {
    this.nuevaImagen = e.target.files[0];
  },

  async guardarEdicion() {


      console.log('fecha_inicio:', this.anuncioEdit.fecha_inicio);
  console.log('fecha_fin:', this.anuncioEdit.fecha_fin);

    const formData = new FormData();
    formData.append('mensaje', this.anuncioEdit.mensaje);
    formData.append('fecha_inicio', this.anuncioEdit.fecha_inicio);
    formData.append('fecha_fin', this.anuncioEdit.fecha_fin);
    formData.append('visible', this.anuncioEdit.visible);
    if (this.nuevaImagen) {
      formData.append('imagen', this.nuevaImagen);
    }
    try {
      await axios.put(`http://localhost:3000/api/anuncios/${this.anuncioEdit._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.fetchAnuncios(); // recargar
          
    const modalElement = document.getElementById('modalEditarAnuncio');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
    } catch (err) {
      console.error('Error al guardar edición:', err);
       const mensaje = err.response?.data?.error || 'Error al guardar comentario';
    alert(mensaje);
    }
  },

  async eliminarAnuncio(id) {
    if (confirm('¿Estás seguro de eliminar este anuncio?')) {
      await axios.delete(`http://localhost:3000/api/anuncios/${id}`);
      this.fetchAnuncios();
    }
  },

  async fetchAnuncios() {
    const res = await axios.get('http://localhost:3000/api/anuncios');
    this.anuncios = res.data;
  }

 
},


}



</script>

<style>
.menu-header {
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 20px;
}

.producto {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 20px;
}

.producto-imagen {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.producto-nombre {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.producto-descripcion {
  margin-bottom: 5px;
}

.producto-categoria {
  margin-bottom: 5px;
}

.producto-precio {
  font-size: 1.2rem;
  font-weight: bold;
}



.modal-backdrop.show {
  z-index: 20;
}


.anuncio-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

@media (min-width: 768px) {
  .anuncio-img {
    height: 300px;
  }
}

@media (min-width: 992px) {
  .anuncio-img {
    height: 300px;
  }
}

</style>