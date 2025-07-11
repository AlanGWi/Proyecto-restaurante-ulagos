<template>
  <HederViewVue />

  <div class="container-fluid p-4">
    <div class="row">
      <div class="col-lg-10 mx-auto">

        <!-- 🔘 BOTONES DE VISTA -->
        <div class="btn-toolbar mb-4" role="toolbar">
          <div class="btn-group me-2" role="group">
            <button @click="vista = 'principal'" class="btn btn-outline-primary">
              Vista Principal
            </button>
          </div>
          <div class="btn-group" role="group">
            <button
              v-for="lugar in lugaresFabricacion"
              :key="lugar"
              @click="vista = lugar"
              class="btn btn-outline-secondary"
            >
              {{ lugar }}
            </button>
          </div>
        </div>

        <!-- ✅ VISTA PRINCIPAL: MESAS + ENVÍOS -->
        <div v-if="vista === 'principal'">

          <!-- 🔵 PEDIDOS EN MESAS -->
          <h2 class="h5 mb-3 text-primary">
            Pedidos en Mesas ({{ pedidos.filter(p => !p.esEnvio).length }})
          </h2>

          <div
            v-for="pedido in pedidos.filter(p => !p.esEnvio)"
            :key="pedido._id"
            class="card mb-4 shadow-sm border-primary"
          >
            <!-- 🔹 Header Mesa -->
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>Mesa:</strong>
                <select
                  :value="pedido.mesa._id"
                  @change="actualizarMesa(pedido._id, $event.target.value)"
                  :disabled="pedido.confirmado"
                  class="form-control d-inline-block w-auto mx-2"
                  style="max-width: 100px"
                >
                  <option v-for="mesa in mesas" :key="mesa._id" :value="mesa._id">
                    {{ mesa.numero }}
                  </option>
                </select>
                <strong>Total:</strong> ${{ pedido.total }} |
                <strong>Confirmado:</strong> {{ pedido.confirmado ? 'Sí' : 'No' }} |
                <strong>Terminado:</strong> {{ pedido.inhabilitar ? 'Sí' : 'No' }}
              </div>
              <div>
                <button
                  @click="confirmarPedido(pedido._id)"
                  v-if="!pedido.confirmado"
                  class="btn btn-sm btn-outline-primary me-2"
                >
                  Confirmar
                </button>
                <button
                  @click="inhabilitarPedido(pedido._id)"
                  v-if="!pedido.inhabilitar"
                  class="btn btn-sm btn-outline-danger"
                >
                  Terminar
                </button>
              </div>
            </div>

            <!-- 🔹 Tabla Items -->
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Preparado</th>
                      <th>Servido</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in pedido.items" :key="item._id + index">
                      <td>{{ item.producto?.nombre || 'Sin nombre' }}</td>
                      <td>${{ item.producto?.precio }}</td>
                      <td>
                        <div>
                          <button
                            @click="actualizarCantidad(pedido._id, item._id, item.cantidad - 1)"
                            :disabled="pedido.confirmado || item.cantidad <= 1"
                            class="btn btn-sm btn-outline-secondary"
                          >−</button>
                          <span class="mx-2">{{ item.cantidad }}</span>
                          <button
                            @click="actualizarCantidad(pedido._id, item._id, item.cantidad + 1)"
                            :disabled="pedido.confirmado"
                            class="btn btn-sm btn-outline-secondary"
                          >+</button>
                        </div>
                      </td>
                      <td>{{ item.preparado ? 'Sí' : 'No' }}</td>
                      <td>{{ item.servido ? 'Sí' : 'No' }}</td>
                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          <button
                            @click="() => { actualizarEstado(pedido._id, item._id, 'servido'); actualizarServidoPor(pedido._id); }"
                            class="btn btn-sm btn-success"
                          >
                            Servir
                          </button>
                          <button
                            @click="eliminarProducto(pedido._id, item.producto._id)"
                            class="btn btn-sm btn-warning"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 🔹 Notas -->
            <div class="mt-2">
              <textarea
                v-model="nuevaNota[pedido._id]"
                class="form-control mb-2"
                placeholder="Escribe una nota..."
              ></textarea>
              <button
                @click="agregarNota(pedido._id)"
                class="btn btn-sm btn-primary"
              >
                Agregar nota
              </button>
            </div>

            <div
              v-if="notasPorPedido[pedido._id]?.length > 0"
              class="px-3 py-2 bg-light border-top"
            >
              <h6 class="fw-bold">Notas internas:</h6>
              <ul class="list-unstyled mb-0">
                <li v-for="nota in notasPorPedido[pedido._id]" :key="nota._id">
                  <textarea
                    class="form-control mb-2"
                    v-model="nota.mensaje"
                    @blur="editarNota(nota)"
                  ></textarea>
                  <button
                    class="btn btn-sm btn-warning"
                    @click="eliminarNota(nota._id, pedido._id)"
                  >
                    Eliminar
                  </button>
                </li>
              </ul>
            </div>

            <div class="card-footer text-end">
              <button
                @click="eliminarPedido(pedido._id)"
                class="btn btn-sm btn-danger"
              >
                Eliminar Pedido
              </button>
            </div>
          </div>

          <!-- 🔵 PEDIDOS EN ENVÍO -->


          <h2 class="h5 mb-3 text-primary">
            Envio ({{ pedidos.filter(p => p.esEnvio).length }})
          </h2>
          
          <div
            v-for="pedido in pedidos.filter(p => p.esEnvio)"
            :key="pedido._id"
            class="card mb-4 shadow-sm border-primary"
          >
            <!-- 🔹 Header pedido -->
            <div class="card-header d-flex justify-content-between align-items-center">


              <div v-if="pedido.envio" class="px-3 py-2">
  <p class="mb-1">
    <strong>Dirección:</strong> {{ pedido.envio.direccionEntrega }}
  </p>
  <p class="mb-1">
    <strong>Telefono:</strong> {{ pedido.envio.telefono }}
  </p>
   <p class="mb-1">
    <strong>Comuna/localidad:</strong> {{ pedido.envio.comuna }}
  </p>
  <p class="mb-1">
    <strong>Estado del Envío:</strong>
    <span
      :class="{
        'text-success': pedido.envio.estadoEnvio === 'entregado',
        'text-warning': pedido.envio.estadoEnvio === 'enviado',
        'text-primary': pedido.envio.estadoEnvio === 'pendiente'
      }"
    >
      {{ pedido.envio.estadoEnvio }}
    </span>
  </p>
</div>

              <div>
                <strong>Envio:</strong>
          
                <strong>Total:</strong> ${{ pedido.total }} |
                <strong>Confirmado:</strong> {{ pedido.confirmado ? 'Sí' : 'No' }} |
                <strong>Terminado:</strong> {{ pedido.inhabilitar ? 'Sí' : 'No' }}
              </div>
              <div>
                <button
                  @click="confirmarPedido(pedido._id)"
                  v-if="!pedido.confirmado"
                  class="btn btn-sm btn-outline-primary me-2"
                >
                  Confirmar
                </button>
                <button
                  @click="inhabilitarPedido(pedido._id)"
                  v-if="!pedido.inhabilitar"
                  class="btn btn-sm btn-outline-danger"
                >
                  Terminar
                </button>
              </div>
            </div>

            <!-- 🔹 Tabla Items -->
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Preparado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in pedido.items" :key="item._id + index">
                      <td>{{ item.producto?.nombre || 'Sin nombre' }}</td>
                      <td>${{ item.producto?.precio }}</td>
                    
                      <td>{{ item.preparado ? 'Sí' : 'No' }}</td>
                     
                      <td>

                
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 🔹 Notas -->
            <div class="mt-2">
              <textarea
                v-model="nuevaNota[pedido._id]"
                class="form-control mb-2"
                placeholder="Escribe una nota..."
              ></textarea>
              <button
                @click="agregarNota(pedido._id)"
                class="btn btn-sm btn-primary"
              >
                Agregar nota
              </button>
            </div>

            <div
              v-if="notasPorPedido[pedido._id]?.length > 0"
              class="px-3 py-2 bg-light border-top"
            >
              <h6 class="fw-bold">Notas internas:</h6>
              <ul class="list-unstyled mb-0">
                <li v-for="nota in notasPorPedido[pedido._id]" :key="nota._id">
                  <textarea
                    class="form-control mb-2"
                    v-model="nota.mensaje"
                    @blur="editarNota(nota)"
                  ></textarea>
                  <button
                    class="btn btn-sm btn-warning"
                    @click="eliminarNota(nota._id, pedido._id)"
                  >
                    Eliminar
                  </button>
                </li>
              </ul>
            </div>


            <div v-if="pedido.esEnvio && pedido.items.every(item => item.preparado)" class="text-end p-2">
<div v-if="pedido.items.every(item => item.preparado)" class="card-footer text-end">
  <button
    :disabled="pedido.envio.estadoEnvio === 'enviado' || pedido.envio.estadoEnvio === 'entregado'"
    @click="cambiarEstadoEnvio(pedido.envio._id, 'enviado')"
    class="btn btn-sm btn-success me-2"
  >
    Marcar como Enviado
  </button>
  <button
    :disabled="pedido.envio.estadoEnvio === 'entregado'"
    @click="cambiarEstadoEnvio(pedido.envio._id, 'entregado')"
    class="btn btn-sm btn-success"
  >
    Marcar como Entregado
  </button>
</div>
</div>

            <div class="card-footer text-end">
              <button
                @click="eliminarPedido(pedido._id)"
                class="btn btn-sm btn-danger"
              >
                Eliminar Pedido
              </button>
            </div>
          </div>
          
          

        </div>

        <!-- ✅ ÁREA DE FABRICACIÓN -->




        <!-- Vista para Área de Fabricación -->

            <!-- VISTA ÁREA DE FABRICACIÓN -->
<div v-else>
  <h2 class="h4 fw-bold mb-4">Área de Fabricación: {{ vista }}</h2>
  

  <div class="row g-3">
    <div
      class="col-md-6 col-lg-4"
        v-for="pedido in pedidos.filter(p =>
    p.confirmado &&
    p.items.some(i =>
      i.producto.lugar_fabricacion === vista &&
      !(i.preparado && i.retirado)
    )
  )"
      :key="pedido._id"
    >
      <!-- Tarjeta única para cada pedido -->
      <div class="card h-100">
        <div class="card-body">
          
            <strong v-if="!pedido.esEnvio">Mesa:</strong> {{ pedido.mesa?.numero || 'Envio' }}
          <ul class="list-group mb-3">
            <li
              class="list-group-item"
              v-for="item in pedido.items.filter(i =>
                i.producto.lugar_fabricacion === vista &&
                !(i.preparado && i.retirado)
              )"
              :key="item._id"
            >
              <strong>{{ item.producto.nombre }}</strong><br />
              Cantidad: {{ item.cantidad }} |
              Preparado: {{ item.preparado ? 'Sí' : 'No' }} |
              Retirado: {{ item.retirado ? 'Sí' : 'No' }}
            </li>
          </ul>

          <!-- Notas -->
          <div v-if="notasPorPedido[pedido._id]?.length > 0" class="bg-light p-2 rounded">
            <h6 class="mb-1">Notas internas:</h6>
            <ul class="list-unstyled mb-0">
              <li
                v-for="nota in notasPorPedido[pedido._id]"
                :key="nota._id"
                class="fst-italic text-muted"
              >
                {{ nota.mensaje }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ✅ Botones por PEDIDO -->
        <div class="card-footer d-flex justify-content-between">
          <button
            @click="marcarTodoPreparado(pedido)"
            class="btn btn-sm btn-primary"
          >
            Marcar TODO preparado
          </button>
          <button
            @click="marcarTodoRetirado(pedido)"
            class="btn btn-sm btn-success"
          >
            Marcar TODO retirado
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


       

      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import HederViewVue from '@/components/HederView.vue';

export default {
  components: { HederViewVue },
  data() {
    return {
      pedidos: [],
      vista: 'principal', // Puede ser 'principal' o un lugar_fabricacion
      lugaresFabricacion: [],
      token: localStorage.getItem('token') || '',
      mesas: [],  
      notasPorPedido: {}, // { pedidoId1: [notas...], pedidoId2: [...] }
      nuevaNota: {} 
    }
  },

async mounted() {
  await this.cargarPedidos();            // Esperamos que los pedidos estén listos
  await this.cargarNotasParaPedidos();  // Ahora sí, con los pedidos cargados
  await this.obtenerMesas();  
  console.log(this.cargarNotasParaPedidos)          // Puedes poner esto al final o antes, como prefieras
},
  methods: {

      marcarTodoPreparado(pedido) {
    pedido.items.forEach(item => {
      if (!item.preparado) {
        this.actualizarEstado(pedido._id, item._id, 'preparado');
      }
    });
  },
  marcarTodoRetirado(pedido) {
    pedido.items.forEach(item => {
      if (!item.retirado) {
        this.actualizarEstado(pedido._id, item._id, 'retirado');
      }
    });
  },

    async cambiarEstadoEnvio(envioId, nuevoEstado) {

      console.log(envioId)
      console.log(nuevoEstado)
  try {
    const usuario = localStorage.getItem('id');

    await axios.put(`http://localhost:3000/api/envios/actualizar-estado/${envioId}`, {
      nuevoEstado,
      enviadoPorId: usuario
    });

    alert(`Estado del envío cambiado a ${nuevoEstado}`);
    this.cargarPedidos();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    alert('No se pudo cambiar el estado del envío');
  }
},
    async agregarNota(pedidoId) {
  const mensaje = this.nuevaNota[pedidoId]?.trim();
  if (!mensaje) return;

  try {
    const res = await axios.post("http://localhost:3000/api/nota", {
      pedidoId,
      mensaje
    });

    if (!this.notasPorPedido[pedidoId]) this.notasPorPedido[pedidoId] = [];
    this.notasPorPedido[pedidoId].push(res.data);

    this.nuevaNota[pedidoId] = ""; // limpiar textarea
  } catch (err) {
    console.error("Error al agregar nota:", err);
  }
},
    async obtenerMesas() {
    try {
      const res = await axios.get('http://localhost:3000/api/mesas');
      this.mesas = res.data;  // Guarda las mesas obtenidas
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      alert("Ocurrió un error al obtener mesas: " + (error.response?.data?.message || error.message));
    }
  },
async cargarPedidos() {
  try {
    const res = await axios.get('http://localhost:3000/api/pedidos/visibles');
    //const pedidosFiltrados = res.data.filter(p => !p.inhabilitar);
    this.pedidos = res.data;
    console.log(this.pedidos)

     // Filtra solo los pedidos válidos: si es envío, que no tenga pendientePago
    this.pedidos = res.data.filter(p => {
      // Mostrar si:
      // - NO es envío
      // - O SI es envío, pero no está pendiente de pago
      return !p.esEnvio || (p.esEnvio && !p.pendientePago);
    });

   // console.log("Pedidos cargados:", this.pedidos);

    // Ahora que los pedidos están cargados, carga las notas asociadas
    await this.cargarNotasParaPedidos();

    this.generarLugaresFabricacion();
  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
  }
},

    generarLugaresFabricacion() {
      const lugaresSet = new Set();
      this.pedidos.forEach(pedido => {
        pedido.items.forEach(item => {
          const lugar = item.producto?.lugar_fabricacion || 'Sin lugar';
          lugaresSet.add(lugar);
        });
      });
      this.lugaresFabricacion = Array.from(lugaresSet);
    },
    actualizarEstado(pedidoId, itemId, campo) {
      axios
        .put(`http://localhost:3000/api/pedidos/pedidos`, {
          pedidoId,
          itemId,
          [campo]: true,
          token: this.token

          
        })
        .then(() => this.cargarPedidos())
        .catch(error => {
          console.error(`Error al actualizar ${campo}:`, error)
        })
    },

    actualizarServidoPor(pedidoId) {
  const userId = localStorage.getItem('id'); // Asumiendo que guardas el ID del usuario que sirve

  axios.put(`http://localhost:3000/api/pedidos/servido-por/${pedidoId}`, {
    userId,
    token: this.token
  })
  .then(() => this.cargarPedidos())
  .catch(error => {
    console.error('Error al actualizar ServidoPor:', error);
    alert('No se pudo registrar quién sirvió el pedido.');
  });
},
        actualizarCantidad(pedidoId, itemId, nuevaCantidad) {
      axios.put('http://localhost:3000/api/pedidos/pedidos', {
        pedidoId,
        itemId,
        cantidad: nuevaCantidad,
        token: this.token
      })
      .then(() => this.cargarPedidos())
      .catch(error => {
        console.error('Error al actualizar la cantidad:', error);
      });
      
    },
    eliminarPedido(pedidoId) {
      const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto del pedido?");
  if (!confirmar) return;
  
  axios.delete(`http://localhost:3000/api/pedidos/${pedidoId}`, {
      headers: { "Access-Control-Allow-Origin": "*" },
      params: { token: this.token }
    })
    .then(() => this.cargarPedidos())
    .catch(error => {
      console.error('Error al eliminar el pedido:', error);
    });
    },
    eliminarProducto(pedidoId, productoId) {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto del pedido?");
  if (!confirmar) return;

  axios.put(`http://localhost:3000/api/pedidos/pedidos/${pedidoId}/${productoId}`, {
    eliminado: true,
    token: this.token
  })
  .then(() => this.cargarPedidos())
  .catch(error => {
    console.error('Error al eliminar el producto del pedido:', error);
  });
},
inhabilitarPedido(pedidoId) {
  const confirmar = window.confirm("¿Estás seguro de que quieres inhabilitar este pedido?");
  if (!confirmar) return;

  axios.put(`http://localhost:3000/api/pedidos/inhabilitar/${pedidoId}`, {
    token: this.token,
    inhabilitar: true
  })
  .then(() => this.cargarPedidos())
  .catch(error => {
    console.error('Error al inhabilitar el pedido:', error);
  });
},
confirmarPedido(pedidoId) {
  axios.put(`http://localhost:3000/api/pedidos/confirmar/${pedidoId}`, {}, {
    params: { token: this.token }
  })
  .then(() => this.cargarPedidos())
  .catch(error => {
    console.error('Error al confirmar el pedido:', error);
  });
},


actualizarMesa(pedidoId, nuevaMesa) {
  axios
    .put(`http://localhost:3000/api/pedidos/actualizar-mesa/${pedidoId}`, {
      nuevaMesa,
      token: this.token
    })
    .then(() => {
      this.cargarPedidos();
    })
    .catch(error => {
      console.error('Error al actualizar la mesa:', error);
      alert('No se pudo actualizar la mesa.');
    });
},

async cargarNotasParaPedidos() {
  try {
    const notasMap = {}; // Cada pedido tendrá su propio array

    const promesas = this.pedidos.map(async (pedido) => {
      const res = await axios.get(`http://localhost:3000/api/nota/porPedido?pedidoId=${pedido._id}`);
      console.log(res.data)
      notasMap[pedido._id] = res.data; // Guarda solo las notas de este pedido
      notasMap[pedido._id.toString()] = res.data;
    });

    await Promise.all(promesas);
    this.notasPorPedido = notasMap;

  } catch (error) {
    console.error("Error al cargar notas:", error);
  }

},

  async editarNota(nota) {
    try {
      await axios.put(`http://localhost:3000/api/nota/${nota._id}`, { mensaje: nota.mensaje });
      // Opcional: mostrar notificación o refrescar datos
    } catch (error) {
      console.error('Error al editar nota:', error);
      alert('No se pudo editar la nota');
    }
  },

  async eliminarNota(notaId, pedidoId) {

    const confirmar = window.confirm("¿Estás seguro de que quieres eliminar esta nota?");
  if (!confirmar) return;



    try {
      await axios.delete(`http://localhost:3000/api/nota/${notaId}`);
      // Eliminar nota localmente para actualizar UI
      this.notasPorPedido[pedidoId] = this.notasPorPedido[pedidoId].filter(n => n._id !== notaId);
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      alert('No se pudo eliminar la nota');
    }
  },



  }
}
</script>

<style scoped>
.btn {
  padding: 4px 8px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover {
  background-color: #4338ca;
}
</style>