<template>
  <div class="container mt-5">
    
    <div class="row justify-content-center">
      
      

      <div class="col-md-8 col-lg-6">

         <ul class="nav nav-tabs">

  
  <li class="nav-item">
    <a class="nav-link" href="/estadoEnvio">Ver estado</a>
  </li>
  
</ul>

        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Detalles de Envío</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="enviarDatosEnvio">
              <div class="mb-3">
                <label class="form-label">Dirección de entrega</label>
                <input v-model="envio.direccionEntrega" type="text" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Comuna/localidad</label>
                <input v-model="envio.comuna" type="text" class="form-control" required />
              </div>

                      <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <input
              v-model="envio.telefono"
              type="tel"
              class="form-control"
              placeholder="+56 9 1234 5678"
              inputmode="numeric"
              pattern="^(\+56)?\s?9[0-9]{8}$"
              maxlength="12"
              required
            />
            <div class="form-text">
              Formato: +56 9 XXXXXXXX o 9XXXXXXXX
            </div>
          </div>

          

              <div class="d-grid">
                <button type="submit" class="btn btn-primary">
                  Confirmar Envío
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute,  } from 'vue-router'
import axios from 'axios'

const route = useRoute()


//const router = useRouter()

// El ID del pedido que se pasa por ruta (por ejemplo, /envio/ID)
const pedidoId = route.params.id
const token_ws = new URLSearchParams(window.location.search).get("token_ws");

const pagoConfirmado = ref(false);


onMounted(async () => {
  if (token_ws) {
    try {
      const confirmacion = await axios.post("http://localhost:3000/api/transbank/confirmar-transaccion", {
        token_ws,
        pedidoId
      });

      if (confirmacion.data.status === 'AUTHORIZED') {
        console.log(" Pago confirmado");
        pagoConfirmado.value = true;
        const pagoData = JSON.parse(localStorage.getItem("pagoPendiente"));


          await axios.post("http://localhost:3000/api/pagos", {
            pedidos: Array.isArray(pagoData.pedidoId) ? pagoData.pedidoId : [pagoData.pedidoId],
            metodo: pagoData.metodo,
            total: pagoData.total,
            transaccionId: token_ws,
            
          });

      } else {
        alert(" El pago fue rechazado.");
      }
    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      alert("Hubo un error al verificar el pago.");
    }
  } else {
    alert("Token de Transbank no encontrado.");
  }
});


const envio = ref({
  pedidoId,             // Se espera esto en el backend como "pedidoId"
  enviadoPorId: '',     // Si necesitas el ID del usuario, ponlo aquí (puede venir de localStorage o sesión)
  direccionEntrega: '', // Este nombre debe coincidir con el del backend
  comuna: '',
  telefono: '',
  //observaciones: ''     // Este también debe coincidir con el nombre del backend
})

// Opcional: Cargar el usuario desde localStorage si aplica
const usuario = JSON.parse(localStorage.getItem('usuario')) || {}
if (usuario._id) {
  envio.value.enviadoPorId = usuario._id
}

const enviarDatosEnvio = async () => {




  try {
    const res = await axios.post('http://localhost:3000/api/envios/crear', envio.value)
    console.log('Envío registrado:', res.data)
    alert(`Envío registrado correctamente. Código: ${res.data.codigoEnvio}`)
   // router.push('/') // Redirige a donde necesites
  } catch (error) {
    console.error('Error al registrar el envío:', error.response?.data || error.message)
    alert('Hubo un error al guardar los datos de envío.')
  }
}
</script>
