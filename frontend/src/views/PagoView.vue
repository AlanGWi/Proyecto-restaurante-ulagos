<template>  
  <HederViewVue></HederViewVue>

  <div class="container">
    <div class="card shadow-lg p-4">
      <div v-if="pedidosPorMesa">
        <h3 class="text-center mb-4">Mesa <span class="text-success">{{ pedidosPorMesa.numeroMesa }}</span></h3>

        <div class="table-responsive mb-4">
          <table class="table table-bordered align-middle text-center">
            <thead class="table-dark">
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pedido, index) in pedidosPorMesa.productos" :key="index">
                <td>{{ pedido.nombre }}</td>
                <td>{{ pedido.cantidad.toLocaleString('es-CL') }}</td>
                <td>${{ pedido.precio.toLocaleString('es-CL') }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="text-end"><strong>Total base:</strong></td>
                <td><strong>${{ pedidosPorMesa.total.toLocaleString('es-CL') }}</strong></td>
              </tr>
              <tr>
                <td colspan="2" class="text-end"><strong>Propina:</strong></td>
                <td><strong>${{ propina.toLocaleString('es-CL') }}</strong></td>
              </tr>
              <tr class="table-primary">
                <td colspan="2" class="text-end"><strong>Total a pagar:</strong></td>
                <td><strong>${{ totalConPropina.toLocaleString('es-CL') }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Sección Propina -->
        <div class="border rounded-3 p-4 mb-4 shadow-sm">
          <h5 class="text-center mb-3">Selecciona una propina</h5>
          <div class="d-flex justify-content-center gap-3 mb-3 flex-wrap">
            <button class="btn btn-outline-success rounded-pill px-4" @click="calcularPropina(5)">
              5% <i class="bi bi-cash-coin ms-1"></i>
            </button>
            <button class="btn btn-outline-success rounded-pill px-4" @click="calcularPropina(10)">
              10% <i class="bi bi-cash-coin ms-1"></i>
            </button>
            <button class="btn btn-outline-success rounded-pill px-4" @click="calcularPropina(20)">
              20% <i class="bi bi-cash-coin ms-1"></i>
            </button>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
            <input type="number" class="form-control w-auto" v-model.number="propinaPersonalizada" placeholder="Otra propina (%)">
            <button class="btn btn-secondary" @click="calcularPropina(propinaPersonalizada)">
              Aplicar <i class="bi bi-plus-circle ms-1"></i>
            </button>
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-lg btn-primary px-5" @click="pagar(totalConPropina)">
            Pagar ahora <i class="bi bi-credit-card ms-2"></i>
          </button>
        </div>
      </div>

      <div v-else class="text-center">
        <h4 class="text-danger">No hay pedidos para esta mesa o ya pagaste.</h4>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';

export default {
  data() {
     return {
    pedidosPorMesa: null, // un solo objeto que unifica todo
    propina: 0,
    propinaPersonalizada: null
  };
  },
  components: {
    HederViewVue,
  },
computed: {
  totalConPropina() {
    return this.pedidosPorMesa ? this.pedidosPorMesa.total + this.propina : 0;
  }
},
  mounted() {
    this.cargarPedidos();
  },
  methods: {
    calcularPropina(porcentaje) {
      if (!porcentaje || porcentaje < 0) return;
      if (this.pedidosPorMesa) {
        this.propina = (this.pedidosPorMesa.total * porcentaje) / 100;
      }
    },
cargarPedidos() {
  const numeroMesa = localStorage.getItem("numeroMesa");


  axios
    .get("http://localhost:3000/api/pedidos/sin-pago")
    .then((response) => {
      const pedidosFiltrados = response.data.filter(
        (pedido) => pedido.mesa?.numero == numeroMesa 
      );

      if (pedidosFiltrados.length > 0) {
        const productos = [];

        pedidosFiltrados.forEach((pedido) => {
          pedido.items.forEach((item) => {
            productos.push({
              nombre: item.producto.nombre,
              cantidad: item.cantidad,
              precio: item.producto.precio
            });
          });
        });

        const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

        this.pedidosPorMesa = {
          numeroMesa,
          productos,
          total
        };
      }
    })
    .catch((error) => {
      console.error("Error al cargar los pedidos:", error);
    });
},
    pagar(total) {

      localStorage.setItem("pagoPendiente", JSON.stringify({
        pedidoIds: JSON.parse(localStorage.getItem("pedidoIds")),
        numeroMesa: localStorage.getItem("numeroMesa"),
        metodo: 'transbank', // en este caso
        propina: this.propina,
        total: this.pedidosPorMesa.total,
        totalConPropina: this.totalConPropina
      }));      

      axios.post("http://localhost:3000/api/transbank/crear-transaccion", {
        monto: Math.round(total),
        ordenCompra: `OC${Date.now()}`,
        sesionId: `SESION${Date.now()}`,
        returnUrl: "http://localhost:8080/confirmacion",
      })
      .then(response => {
        if (response.data.url && response.data.token) {
          window.location.href = `${response.data.url}?token_ws=${response.data.token}`;
        }
      })
      .catch(error => {
        console.error("Error al procesar el pago:", error);
      });
    }
  },
};
</script>
