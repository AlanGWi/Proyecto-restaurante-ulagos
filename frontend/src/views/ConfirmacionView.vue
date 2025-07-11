<template>
  <div class="container py-5 text-center">
    <div v-if="cargando">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Confirmando tu pago, por favor espera...</p>
    </div>

    <div v-else-if="exito">
      <div class="alert alert-success">
        <h2 class="mb-3"> ¡Pago exitoso!</h2>
        <p><strong>Monto total:</strong> ${{ pagoInfo.totalConPropina.toFixed(0) }}</p>
        <p><strong>Propina:</strong> ${{ pagoInfo.propina.toFixed(0) }}</p>
        <p><strong>Método:</strong> {{ pagoInfo.metodo }}</p>
        <p><strong>ID Transacción:</strong> {{ pagoInfo.transaccionId }}</p>
        <router-link to="/" class="btn btn-success mt-3">Volver al inicio</router-link>
      </div>
    </div>

    <div v-else>
      <div class="alert alert-danger">
        <h2> Error al procesar el pago</h2>
        <p>{{ mensajeError }}</p>
        <router-link to="/" class="btn btn-danger mt-3">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cargando: true,
      exito: false,
      mensajeError: "",
      pagoInfo: null
    };
  },
  mounted() {
    this.confirmarPago();
  },
  methods: {
    async confirmarPago() {
      const token_ws = new URLSearchParams(window.location.search).get("token_ws");

      if (!token_ws) {
        this.mensajeError = "Token de pago no proporcionado.";
        this.cargando = false;
        return;
      }

      try {
        const res = await axios.post("http://localhost:3000/api/transbank/confirmar-transaccion", {
          token_ws
        });

        if (res.data.status === 'AUTHORIZED') {
          const pagoData = JSON.parse(localStorage.getItem("pagoPendiente"));
          console.log(JSON.parse(localStorage.getItem("pagoPendiente")))

          const pagoCreado = await axios.post("http://localhost:3000/api/pagos", {
            pedidos: pagoData.pedidoIds,
            metodo: pagoData.metodo,
            propina: pagoData.propina,
            total: pagoData.total,
            totalConPropina: pagoData.totalConPropina,
            transaccionId: token_ws,
            estado: 'completado'
          });

          this.pagoInfo = pagoCreado.data;

          // Limpieza
          

          this.exito = true;
        } else {
          this.mensajeError = "El pago fue rechazado por Transbank.";
        }
      } catch (err) {
        console.error("Error al confirmar el pago:", err);
        this.mensajeError = "Hubo un problema al confirmar el pago.";
      } finally {
        this.cargando = false;
        localStorage.removeItem("pagoPendiente");
        localStorage.removeItem("pedidoIds");
      }
    }
  }
};
</script>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>