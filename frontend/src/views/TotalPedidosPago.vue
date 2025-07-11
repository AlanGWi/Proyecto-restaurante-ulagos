<template>
  <HederViewVue />
  <div class="container-fluid p-4">
    <div class="row">
      <div class="col-lg-10 mx-auto">

        <div v-if="vista === 'principal'">
          <h1 class="h3 fw-bold mb-4">Pedidos</h1>

          <div v-for="grupo in pedidosPorMesa" :key="grupo.mesa" class="card mb-4 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>Mesa:</strong> {{ grupo.numeroMesa }} | |
                <strong>Total:</strong> ${{ grupo.total }}
              </div>
            </div>

            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in grupo.items" :key="index">
                      <td>{{ item.producto?.nombre || 'Sin nombre' }}</td>
                      <td>${{ item.producto?.precio.toLocaleString('es-CL') }}</td>
                      <td>{{ item.cantidad }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            

            <div class="card-footer text-end">
              <div class="mb-2">
  <!-- Sección de propina -->
  <div class="mb-2 d-flex flex-column align-items-end">
    <div class="d-flex align-items-center mb-2 gap-2">
      <label class="form-label m-0">Propina:</label>
   <input
  type="number"
  class="form-control form-control-sm"
  v-model.number="propinasPorMesa[grupo.mesa]"
  placeholder="0"
  style="width: 100px"
  :min="0"
/>
    </div>

    <!-- Botones de porcentaje rápido -->
    <div class="mb-2">
      <button class="btn btn-outline-secondary btn-sm me-1"
  @click="propinasPorMesa[grupo.mesa] = Math.round(grupo.total * 0.05)">
  +5%
</button>
<button class="btn btn-outline-secondary btn-sm me-1"
  @click="propinasPorMesa[grupo.mesa] = Math.round(grupo.total * 0.10)">
  +10%
</button>
<button class="btn btn-outline-secondary btn-sm"
  @click="propinasPorMesa[grupo.mesa] = Math.round(grupo.total * 0.20)">
  +20%
</button>
    </div>
  </div>
  

  <div class="fw-bold mt-2">
    Total con propina: ${{ (grupo.total + (propinasPorMesa[grupo.mesa] || 0)).toLocaleString('es-CL') }}
</div>

                <div>
    <button
      class="btn btn-success btn-sm me-2"
      @click="pagar(grupo.pedidosIds, 'efectivo', grupo.total, grupo.propina)"
    >
      Pagar en Efectivo
    </button>
    <button
      class="btn btn-primary btn-sm"
      @click="pagar(grupo.pedidosIds, 'tarjeta', grupo.total, grupo.propina)"
    >
      Pagar con Tarjeta
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
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';

export default {
  components: { HederViewVue },
  data() {
    return {
      pedidos: [],
      vista: 'principal',
      token: localStorage.getItem('token') || '',
          propinasPorMesa: {} // clave: número de mesa, valor: propina
    };
  },
  computed: {


    pedidosPorMesa() {
  const agrupados = {};

  this.pedidos.forEach(pedido => {
    if (!pedido.mesa || !pedido.mesa.numero) {
      console.warn('Pedido sin mesa o sin número:', pedido);
      return; // salta este pedido
    }

    const numeroMesa = pedido.mesa.numero;

    if (!agrupados[numeroMesa]) {
      agrupados[numeroMesa] = {
        numeroMesa,
        mesa: pedido.mesa,
        items: [],
        total: 0,
        pedidosIds: []
      };

      if (!this.propinasPorMesa[numeroMesa]) {
        this.propinasPorMesa[numeroMesa] = 0;
      }
    }

    agrupados[numeroMesa].items.push(...pedido.items);
    agrupados[numeroMesa].total += pedido.total;
    agrupados[numeroMesa].pedidosIds.push(pedido._id);
  });

  return Object.values(agrupados);
}

  },
  mounted() {
    this.cargarPedidos();   
  },
  methods: {

    pagar(pedidosIds, metodo, total,propina) {
         const propinaFinal = Number(propina) || 0; // Asegura que sea número válido
           const totalConPropina = total + propinaFinal;

  const pago = {
    pedidos: pedidosIds,
    metodo,
    propina,
    total,
    totalConPropina
  };

  axios
    .post('http://localhost:3000/api/pagos', pago)
    .then(() => {
      alert(`Pago con ${metodo} registrado correctamente.`);
      this.cargarPedidos();
    })
    .catch(error => {
      console.error('Error al registrar el pago:', error);
      alert('Hubo un error al procesar el pago.');
    });
},

  cargarPedidos() {
    axios
      .get('http://localhost:3000/api/pedidos/sin-pago')
      .then(response => {
        this.pedidos = response.data;
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error al cargar los pedidos sin pago:', error);
      });
  },
  }
};
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
