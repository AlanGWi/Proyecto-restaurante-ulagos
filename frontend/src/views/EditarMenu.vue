<template> 
  <HederViewVue />

  <div class="container">
    

    <form @submit.prevent="Guardar">
      <div class="row">
        <!-- Primera columna -->
        <div class="col-md-6">
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre:</label>
            <input v-model="form.nombre" type="text" id="nombre" required placeholder="Ejemplo: torta" class="form-control">
          </div>

          <div class="form-group">
            <label for="precio" class="form-label">Precio:</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input v-model="form.precio" type="number" class="form-control" id="precio" aria-label="Precio en pesos">
            </div>
          </div>

          <div >
              <label class="form-label">Precio sin IVA (19%):</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  :value="Math.round(form.precio / 1.19).toLocaleString('es-CL')" 
                  class="form-control" readonly 
                />
              </div>
            </div>

          <div class="form-group">
            <label for="descripcion" class="form-label">Descripción:</label>
            <textarea v-model="form.descripcion" class="form-control" id="descripcion" rows="3"></textarea>
          </div>
        </div>

        <!-- Segunda columna -->
        <div class="col-md-6">
          <!-- Tipo -->
          <div class="form-group">
            <label class="form-label">Tipo:</label>
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#opciones" type="button">Opciones</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#manual" type="button">Manual</button>
              </li>
            </ul>

            <div class="tab-content">
              <div class="tab-pane fade show active" id="opciones">
                <select v-model="form.Categoria" class="form-select">
                  <option v-for="Categoria in categoriasUnicas" :key="Categoria.Categoria">{{ Categoria.Categoria }}</option>
                </select>
              </div>
              <div class="tab-pane fade" id="manual">
                <input v-model="form.Categoria" type="text" class="form-control" placeholder="Escriba el tipo manualmente">
              </div>
            </div>
          </div>

          <!-- Lugar de Preparación -->
          <div class="form-group">
            <label class="form-label">Lugar de preparación:</label>
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#opciones-lugar" type="button">Opciones</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#manual-lugar" type="button">Manual</button>
              </li>
            </ul>

            <div class="tab-content">
              <div class="tab-pane fade show active" id="opciones-lugar">
                <select v-model="form.lugar_fabricacion" class="form-select">
                  <option v-for="lugar in lugaresUnicos" :key="lugar">{{ lugar }}</option>
                </select>
              </div>
              <div class="tab-pane fade" id="manual-lugar">
                <input v-model="form.lugar_fabricacion" type="text" class="form-control" placeholder="Escriba el lugar manualmente">
              </div>
            </div>
          </div>



          <div class="mb-3">
            <label class="form-label">Tipo menú o producto:</label>

            <select v-model="form.tipo" class="form-select" aria-label="Default select example">
          <option value="Menu">Menu</option>
          <option value="Producto">Producto</option>
        </select>
        </div>

          <!-- Imagen -->
          <div class="form-group">
            <label for="imagen" class="form-label">Imagen:</label>
            <div class="input-group mb-3">
              <input type="file" @change="onFileChange" name="imagen" class="form-control" id="imagen">
              <label class="input-group-text">Subir</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de guardar -->
      <div class="text-center mt-3">
        <button type="submit" class="btn btn-primary">Guardar edición</button>
      </div>
    </form>
  </div>
</template>

<script>
import HederViewVue from '@/components/HederView.vue';
import axios from 'axios';

export default {
  name: "cambioVar",
  components: {
    HederViewVue
  },
  data() {
    return {
      categoriasUnicas: "",
      lugaresUnicos: "",
      listaProducto: "",
      form: {
        nombre: "",
        precio: "",
        descripcion: "",
        Categoria: "",
        lugar_fabricacion: "",
        imagen_nombre: "",
        imagen: null,
        tipo:"",
      },
      MenuId: null,
      token: ""
    };
  },
  methods: {
    onFileChange(e) {
      this.form.imagen = e.target.files[0];
    },

    

    Guardar() {

      const formData = new FormData();
      formData.append('nombre', this.form.nombre);
      formData.append('precio', this.form.precio);
      formData.append('descripcion', this.form.descripcion);
      formData.append('Categoria', this.form.Categoria);
      formData.append('lugar_fabricacion', this.form.lugar_fabricacion);
      formData.append('imagen', this.form.imagen);
      formData.append('imagenVieja', this.form.imagen_nombre);
      formData.append('tipo', this.form.tipo); 
      formData.append('token', this.token);

      axios.put('http://192.168.56.1:3000/api/menu/menus/' + this.MenuId, formData)
        .then(datos => {
          console.log(datos);
          alert("exito");
        })
       .catch(error => {
        console.error('Error al editar el producto:', error);
        const mensaje = error.response?.data?.message || 'Error al editar el producto. Intenta nuevamente.';
        alert(`Error: ${mensaje}`);
       });
    }
  },
  mounted() {
    this.MenuId = this.$route.params.id;
    this.token = localStorage.getItem("token");

    axios.get("http://localhost:3000/api/menu/" + this.MenuId).then(datos => {
      this.form.id = datos.data._id;
      this.form.Categoria = datos.data.Categoria;
      this.form.descripcion = datos.data.descripcion;
      this.form.nombre = datos.data.nombre;
      this.form.precio = datos.data.precio;
      this.form.lugar_fabricacion = datos.data.lugar_fabricacion;
      this.form.imagen_nombre = datos.data.imagen_nombre;
    });

    axios.get("http://localhost:3000/api/menu/allMenu").then(data => {
      this.listaProducto = data.data;

      this.categoriasUnicas = [...new Set(this.listaProducto.map(item => item.Categoria))].map(Categoria => ({ Categoria }));
      this.lugaresUnicos = [...new Set(this.listaProducto.map(item => item.lugar_fabricacion))];
    });
  }
};
</script>

<style>
.btn-guardar {
  width: 550px;
  height: 50px;
  margin-bottom: -80px;
}
</style>