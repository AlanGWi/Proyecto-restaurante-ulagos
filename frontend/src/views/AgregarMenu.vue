<template> 
  <HederViewVue />

  <div class="container">

 <ul class="nav nav-tabs">

  <li class="nav-item">
    <a class="nav-link" href="/agregar">Agregar</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="/deshabilitados">Deshabilitados</a>
  </li>
  
</ul>

    <form @submit.prevent="Guardar">
      <div class="row">
        <!-- Primera columna -->
        <div class="col-md-6">
          <fieldset>
            <legend>Información básica</legend>

            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre:</label>
              <input v-model="form.nombre" type="text" id="nombre" required placeholder="Ejemplo: torta" class="form-control" />
            </div>

            <div class="mb-3">
              <label for="precio" class="form-label">Precio:</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input v-model="form.precio" type="number" required class="form-control" id="precio" aria-label="Precio en pesos" :min="1"/>
              </div>
            </div>

            <div >
              <label class="form-label">Precio sin IVA (19%):</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input :value="(form.precio / 1.19).toFixed(0)" class="form-control" readonly />
              </div>
            </div>

            <div class="mb-3">
              <label for="descripcion" required class="form-label">Descripción:</label>
              <textarea v-model="form.descripcion" class="form-control" id="descripcion" rows="3" required></textarea>
            </div>
          </fieldset>
        </div>

        <!-- Segunda columna -->
        <div class="col-md-6">
          <fieldset>
            <legend>Categorías</legend>

            <!-- Tipo -->
            <div class="mb-3">
              <label class="form-label">Tipo de producto:</label>
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
                  <select v-model="form.Categoria" class="form-select" >
                    <option v-for="Categoria in categoriasUnicas" :key="Categoria.Categoria">{{ Categoria.Categoria }}</option>
                  </select>
                </div>
                <div class="tab-pane fade" id="manual">
                  <input v-model="form.Categoria" type="text" class="form-control" placeholder="Escriba el tipo manualmente"  />
                </div>
              </div>
            </div>

            <!-- Lugar de Fabricación -->
            <div  class="form-group" >
              <label class="form-label">Lugar de Preparación:</label>
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#opciones2" type="button">Opciones</button>
                </li>
                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#manual2" type="button">Manual</button>
                </li>
              </ul>

              <div class="tab-content" >
                <div class="tab-pane fade show active" id="opciones2">
                  <select v-model="form.lugar_fabricacion" class="form-select" >
                    <option v-for="lugar in lugaresUnicos" :key="lugar">{{ lugar }}</option>
                  </select>
                </div>
                <div class="tab-pane fade" id="manual2">
                  <input v-model="form.lugar_fabricacion" type="text" class="form-control" placeholder="Escriba el lugar manualmente"  />
                </div>
              </div>
            </div>
          </fieldset>

          <div class="mb-3">
            <label class="form-label">Tipo menú o producto:</label>

            <select v-model="form.tipo" class="form-select" required aria-label="Default select example">
          <option value="Menu">Menu</option>
          <option value="Producto">Producto</option>
        </select>

          </div>
        

          <!-- Imagen -->
          <fieldset>
            <legend>Imagen</legend>
            <div class="mb-3">
              <div class="input-group">
                <input required type="file" @change="onFileChange" name="imagen" class="form-control" id="imagen" />
                <label class="input-group-text">Subir</label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <!-- Botón de guardar -->
      <div class="text-center mt-3">
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  </div>
</template>
  <script>
  
  import HederViewVue from '@/components/HederView.vue';
  
  import axios from 'axios'
  
  export default{
      name:"cambioVar",
  
    components:{
    HederViewVue
    },
  
    data: function() {
    return {
      listaProducto: "", 
      categoriasUnicas: "",
      lugaresUnicos: [], 
      form: {
        nombre: "",
        precio: "",
        descripcion: "",
        Categoria: "",
        lugar_fabricacion: "",
        tipo:"",
        imagen: null, 
        token:"",
        
      },
     
    }
  
  },
  methods:{
  
    onFileChange(e) {
    this.form.imagen = e.target.files[0];
  },
  
  Guardar() {


     if (
    !this.form.nombre ||
    !this.form.precio ||
    !this.form.descripcion ||
    !this.form.Categoria ||
    !this.form.lugar_fabricacion ||
    !this.form.tipo ||
    !this.form.imagen ||
    !this.form.token
  ) {
    alert("Por favor complete todos los campos del formulario antes de guardar.");
    return;
  }

    const formData = new FormData();
    formData.append('nombre', this.form.nombre);
    formData.append('precio', this.form.precio);
    formData.append('descripcion', this.form.descripcion);
    formData.append('Categoria', this.form.Categoria);
    formData.append('lugar_fabricacion', this.form.lugar_fabricacion);
    formData.append('tipo', this.form.tipo); 
    formData.append('imagen', this.form.imagen);
   formData.append("token",this.form.token)
  
    console.log(formData)
 
  
axios.post('http://localhost:3000/api/menu/addMenu', formData)
  .then(response => {
    console.log(response.data);
    alert("Éxito: producto agregado.");
  })
  .catch(error => {
    console.error('Error al agregar el producto:', error);
    const mensaje = error.response?.data?.message || 'Error al agregar el producto. Intenta nuevamente.';
    alert(`Error: ${mensaje}`);
  });
  }
  },
  
  mounted:function(){
    this.form.token = localStorage.getItem("token")
  
          let direccion = "http://localhost:3000/api/menu/allMenu" ;
          axios.get(direccion).then( data =>{
            this.listaProducto = data.data;

              this.categoriasUnicas = this.listaProducto.filter((item, index, self) => {
                return self.findIndex(i => i.Categoria === item.Categoria) === index;
              }).map(item => ({ Categoria: item.Categoria }));

              this.lugaresUnicos = this.listaProducto.filter((item, index, self) => {
                return self.findIndex(i => i.lugar_fabricacion === item.lugar_fabricacion) === index;
              }).map(item => item.lugar_fabricacion);
               });
          
              console.log(this.categoriasUnicas);            
              
          
      }
  }
  </script>
  
  <style>
  .btn-guardar {
    width: 90%;
    height: 50px;
    margin-bottom: 70px;
  }
  </style>