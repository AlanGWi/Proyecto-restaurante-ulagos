<template>
  <div class="container my-5">
    <h1 class="mb-4">Consultar estado del envío</h1>

    <!-- Input para ingresar el código -->
    <div class="form-group">
      <label for="codigoEnvio">Código de envío</label>
      <input
        type="text"
        id="codigoEnvio"
        v-model="codigoIngresado"
        class="form-control"
        placeholder="Ingresa el código de envío"
      />
    </div>

    <!-- Botón para consultar -->
    <button class="btn btn-primary mt-2" @click="consultarEstadoEnvio">
      Consultar estado
    </button>

    <!-- Mensaje de carga -->
    <div v-if="cargando" class="alert alert-info mt-3">Cargando estado del envío...</div>

    <!-- Mensaje de error -->
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <!-- Resultado -->
    <div v-if="estadoEnvio" class="mt-4 border p-3 rounded shadow-sm">
      <h4>Resultado para el código: {{ codigoIngresado }}</h4>
      <p><strong>Estado actual:</strong> {{ estadoEnvio.estadoEnvio }}</p>
      <p><strong>Dirección de entrega:</strong> {{ estadoEnvio.direccion }}</p>
      <p><strong>Transportista:</strong> {{ estadoEnvio.enviadoPor?.Username || 'No asignado' }}</p>

    
      <!-- Botón de cancelar -->
  <button
  class="btn btn-danger mt-3"
  @click="cancelarEnvio"
  :disabled="estadoEnvio.estadoEnvio === 'cancelado' || estadoEnvio.estadoEnvio === 'entregado'"
>
  Cancelar envío
</button>

  <!-- Mensaje si ya está cancelado -->
  <div v-if="estadoEnvio.estadoEnvio === 'cancelado'" class="mt-2 text-danger">
    Este envío ya fue cancelado.
  </div>


    </div>
  </div>



  

</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      codigoIngresado: "",
      estadoEnvio: null,
      cargando: false,
      error: null,
      cancelando: false,
    };
  },
  methods: {
    async consultarEstadoEnvio() {
      this.error = null;
      this.estadoEnvio = null;

      if (!this.codigoIngresado.trim()) {
        this.error = "Por favor, ingresa un código de envío.";
        return;
      }

      this.cargando = true;

      try {
        const res = await axios.get(
          `http://localhost:3000/api/envios/estado/${this.codigoIngresado.trim()}`
        );
        this.estadoEnvio = res.data;
        console.log(res.data)
      } catch (err) {
        console.error("Error al obtener estado del envío:", err);
        this.error = "No se pudo obtener el estado del envío. Verifica el código.";
      } finally {
        this.cargando = false;
      }
    },
    async cancelarEnvio() {
    if (!confirm("¿Estás seguro de que deseas cancelar este envío?")) return;

    this.cancelando = true;
    this.error = null;

    try {
      await axios.put(
        `http://localhost:3000/api/envios/cancelar/${this.codigoIngresado.trim()}`
      );

      // Actualizar estado local con la respuesta
      this.estadoEnvio.estado = "Cancelado";
      alert("El envío ha sido cancelado con éxito.");
    } catch (err) {
      console.error("Error al cancelar el envío:", err);
      this.error = "No se pudo cancelar el envío.";
    } finally {
      this.cancelando = false;
    }
  }
  }
};
</script>