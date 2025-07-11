<template>

  <HederViewVue></HederViewVue>
  <div class="container py-4">


     <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/agregar">Agregar</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/deshabilitados">Deshabilitados</a>
  </li>
  
</ul>
    
    
    <h2 class="mb-4 text-center">Productos Deshabilitados</h2>

    <div v-for="categoria in categoriasUnicas" :key="categoria" class="mb-5">
      <h4 class="mb-3">{{ categoria }}</h4>
      
      <div class="row g-3">
        <div 
          class="col-sm-6 col-md-4 col-lg-3" 
          v-for="producto in productosPorCategoria(categoria)" 
          :key="producto._id"
        >
          <div class="card h-100 shadow-sm">
            <img 
              :src="producto.imagenUrl" 
              class="card-img-top" 
              :alt="producto.nombre" 
              style="object-fit: cover; height: 180px;"
            />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ producto.nombre }}</h5>
              <p class="card-text small text-muted">{{ producto.descripcion }}</p>
              <p class="fw-bold mt-auto">${{ producto.precio }}</p>
              <button 
                v-if="rol === 'ADMIN'" 
                class="btn btn-success btn-sm mt-2"
                @click="habilitarProducto(producto._id)"
              >
                Habilitar
              </button>

              <a v-if="rol==='ADMIN'" @click="editar(producto._id)" class="btn btn-primary">editar</a>
                <a v-if="rol==='ADMIN'" data-bs-toggle="modal" 
                data-bs-target="#terminarPedidoModal" @click="eliminarproducto=producto._id" class="btn btn-primary">eliminar</a>

              
            </div>
          </div>
        </div>
      </div>
    </div>

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




  </div>
</template>
<script>
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';

export default {
  components: { HederViewVue },
  data() {
    return {
      rol: localStorage.getItem("role"),
      token: localStorage.getItem("token"),
      categoriasUnicas: [],
      listaProductos: [],
      eliminarproducto: ""
    };
  },
  mounted() {
    this.cargarProductosDeshabilitados();
  },
  methods: {
    cargarProductosDeshabilitados() {
      axios.get("http://localhost:3000/api/menu/allMenu")
        .then(({ data }) => {
          this.listaProductos = data.filter(p => !p.Habilitado);
          this.categoriasUnicas = [...new Set(this.listaProductos.map(p => p.Categoria))];
        })
        .catch(error => console.error("Error al cargar productos:", error));
    },
    productosPorCategoria(categoria) {
      return this.listaProductos.filter(p => p.Categoria === categoria);
    },
    habilitarProducto(id) {
      axios.put(`http://localhost:3000/api/menu/estado/${id}`, { habilitado: true })
        .then(() => this.cargarProductosDeshabilitados())
        .catch(error => console.error("Error al habilitar producto:", error));
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


  confirmareliminar(){
    this.eliminar(this.eliminarproducto)
  },



  }
};
</script>
