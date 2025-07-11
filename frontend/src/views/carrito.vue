<script>
import axios from "axios";

export default {
  data() {
    return {
      productosAgrupados: [],
          mesaSeleccionada: null,  // cambiamos esto
      mesas: [],   // Aquí guardaremos las mesas disponibles
    };
  },

  mounted() {

    this.obtenerMesas().then(() => {
    const numeroGuardado = localStorage.getItem("numeroMesa");
    const idGuardado = localStorage.getItem("mesaId");

    if (numeroGuardado && idGuardado) {
      const mesa = this.mesas.find(m => m._id === idGuardado);
      if (mesa) this.mesaSeleccionada = mesa;
    }
  });
    // Llamamos para obtener mesas disponibles
    

    // Código actual para obtener productos agrupados
    const rutaActual = this.$route;
    const idsParam = rutaActual.params.ids;
    const ids = idsParam.split(",");

    const promesas = ids.map((id) => axios.get("http://localhost:3000/api/menu/" + id));

    Promise.all(promesas).then((respuestas) => {
      const productosAgrupados = {};
      respuestas.forEach((respuesta) => {
        const producto = respuesta.data;
        const cantidadLocal = localStorage.getItem(`cantidad-${this.numeroMesa}-${producto._id}`);
        if (cantidadLocal) {
          producto.cantidad = parseInt(cantidadLocal);
        } else if (producto._id in productosAgrupados) {
          productosAgrupados[producto._id].cantidad += 1;
          return;
        } else {
          producto.cantidad = 1;
        }
        productosAgrupados[producto._id] = producto;
      });

      this.productosAgrupados = Object.values(productosAgrupados);
      console.log(this.productosAgrupados);
    });

    window.addEventListener('popstate', this.borrarLocalStorage);
  },

  methods: {
    async obtenerMesas() {
      try {
        const res = await axios.get('http://localhost:3000/api/mesas');
        this.mesas = res.data;
        this.mesas = res.data.filter(mesa => mesa.activa === true);
      } catch (error) {
        console.error('Error al obtener mesas:', error);
        alert("Ocurrió un error: " + (error.response?.data?.message || error.message));
      }
    },

    guardarNumeroMesa() {
       if (this.mesaSeleccionada) {
    localStorage.setItem("numeroMesa", this.mesaSeleccionada.numero);
    localStorage.setItem("mesaId", this.mesaSeleccionada._id);
  }
    },

    borrarLocalStorage() {
      for (let clave in localStorage) {
        if (clave.startsWith(`cantidad-${this.numeroMesa}-`)) {
          localStorage.removeItem(clave);
        }
      }
    },

    sumarCantidad(producto) {
      producto.cantidad++;
      localStorage.setItem(`cantidad-${this.numeroMesa}-${producto._id}`, producto.cantidad);
    },

    restarCantidad(producto) {
      if (producto.cantidad > 1) {
        producto.cantidad--;
        localStorage.setItem(`cantidad-${this.numeroMesa}-${producto._id}`, producto.cantidad);
      }
    },

    eliminarProducto(producto) {
      const index = this.productosAgrupados.indexOf(producto);
      if (index > -1) {
        this.productosAgrupados.splice(index, 1);
        localStorage.removeItem(`cantidad-${this.numeroMesa}-${producto._id}`);
      }
    },

    llamarMesero() {
   if (!this.mesaSeleccionada || !this.mesaSeleccionada._id) {
  alert("Por favor seleccione una mesa");
  return;
}
      if (!this.productosAgrupados || this.productosAgrupados.length === 0) {
        alert("No hay productos seleccionados para enviar el pedido.");
        return;
      }

      // Armar array de ítems
      const items = this.productosAgrupados.map(producto => ({
        producto: producto._id,
        cantidad: producto.cantidad
      }));

      // Calcular el total
      const total = this.productosAgrupados.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

      // Armar el pedido usando el ID de la mesa seleccionado
      const pedidoGrupo = {
        items,
        mesa: this.mesaSeleccionada._id,
        total
      };

      console.log("Pedido enviado:", pedidoGrupo);

      axios.post("http://localhost:3000/api/pedidos/pedidos", pedidoGrupo)
        .then(response => {
          console.log("Pedido creado:", response.data);

          this.mostrarNotificacion("Espere al mesero, su pedido está siendo procesado...", "info");

          let pedidos = JSON.parse(localStorage.getItem("pedidoIds")) || [];

          pedidos.push(response.data._id);
          localStorage.setItem("pedidoIds", JSON.stringify(pedidos));

          this.$router.push("/");
        })
        .catch(error => {
          console.error("Error al crear el pedido:", error);
        });
    },

    mostrarNotificacion(mensaje, tipo) {
      const notificacion = document.createElement("div");
      notificacion.classList.add("notificacion", tipo);
      notificacion.innerText = mensaje;
      document.body.appendChild(notificacion);
      setTimeout(() => notificacion.remove(), 10000);
    },



    enviarADomicilio() {
  if (!this.productosAgrupados || this.productosAgrupados.length === 0) {
    alert("No hay productos seleccionados para enviar el pedido.");
    return;
  }

  const items = this.productosAgrupados.map(producto => ({
    producto: producto._id,
    cantidad: producto.cantidad
  }));

  const total = this.productosAgrupados.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

  const pedidoGrupo = {
    items,
    total,
    envio: true // puedes usar este flag para distinguir que es a domicilio
  };

  axios.post("http://localhost:3000/api/pedidos/pedidos", pedidoGrupo)
    .then(response => {
      console.log("Pedido creado para envío:", response.data);

      // Guardar el ID en localStorage para el siguiente paso
      let pedidos = JSON.parse(localStorage.getItem("pedidoIds")) || [];
      pedidos.push(response.data._id);
      localStorage.setItem("pedidoIds", JSON.stringify(pedidos));

      this.mostrarNotificacion("Pedido para envío a domicilio creado. Complete los datos de envío.", "info");

      // Redirigir a formulario de datos de envío
      this.$router.push(`/envio/${response.data._id}`);
    })
    .catch(error => {
      console.error("Error al crear pedido para envío:", error);
    });
}
  }
};
</script>