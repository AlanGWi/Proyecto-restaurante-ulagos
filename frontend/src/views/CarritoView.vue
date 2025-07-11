<template> 
  <div class="container my-5">
    <h1 class="mb-3">Detalles del carrito</h1>

    <div class="row">
      <div class="col-sm-6 col-md-4 col-lg-3" v-for="producto in productosAgrupados" :key="producto._id">
        <div class="producto">
          <img :src="producto.imagenUrl" class="producto-imagen" :alt="producto.nombre">
          <h5 class="producto-nombre">{{ producto.nombre }}</h5>
          <p class="producto-descripcion">{{ producto.descripcion }}</p>
          <p class="producto-categoria">{{ producto.Categoria }}</p>
          <p class="producto-precio">{{ producto.precio }}</p>
          <div class="producto-cantidad">
            <button class="producto-cantidad-resta" @click="restarCantidad(producto)">-</button>
            <span class="producto-cantidad-numero">{{ producto.cantidad }}</span>
            <button class="producto-cantidad-suma" @click="sumarCantidad(producto)">+</button>
          </div>
          <button class="producto-eliminar" @click="eliminarProducto(producto)">Eliminar</button>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <div class="form-group">
        <label for="mesa-select">Selecciona una mesa</label>
       <select id="mesa-select" class="form-control" v-model="mesaSeleccionada" @change="guardarNumeroMesa">
  <option disabled value="">-- Selecciona una mesa --</option>
  <option v-for="mesa in mesas" :key="mesa._id" :value="mesa">
    {{ mesa.numero }} 
  </option>
</select>
      </div>
      <button class="btn btn-primary" @click="llamarMesero">Llamar al mesero</button>
      <button class="btn btn-primary" @click="enviarADomicilio">domicilio</button>
      <button class="btn btn-secondary" @click="$router.go(-1)">Volver</button>
    </div>


    <div class="form-group mt-3">
  <label for="nota">Nota interna (opcional)</label>
  <textarea
    id="nota"
    v-model="notaInterna"
    class="form-control"
    rows="3"
    placeholder="Ejemplo: sin cebolla, alergias, etc."
  ></textarea>
</div>

  </div>
</template>

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
          const pedidoId = response.data._id;
          console.log("Pedido creado:", response.data);


              // Guardar nota si se escribió una nota
            if (this.notaInterna && this.notaInterna.trim() !== '') {
            axios.post("http://localhost:3000/api/nota", {
              pedidoId,
              mensaje: this.notaInterna.trim()
            });
          }

          
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

  const total = this.productosAgrupados.reduce(
    (acc, prod) => acc + (prod.precio * prod.cantidad),
    0
  );

  // Crear el pedido primero (para tener su ID)
  const pedidoGrupo = {
    items,
    total,
    esEnvio: true
  };

  axios.post("http://localhost:3000/api/pedidos/pedidos", pedidoGrupo)
    .then(response => {
      const pedidoCreado = response.data;

      let pedidos = JSON.parse(localStorage.getItem("pedidoIds")) || [];
      pedidos.push(pedidoCreado._id);
      localStorage.setItem("pedidoIds", JSON.stringify(pedidos));

             if (this.notaInterna && this.notaInterna.trim() !== '') {
            axios.post("http://localhost:3000/api/nota", {
              pedidoId: pedidoCreado._id,
              mensaje: this.notaInterna.trim()
            });
          }
      // Guardar la info en localStorage por si se necesita después de volver del pago
      localStorage.setItem("pagoPendiente", JSON.stringify({
        pedidoId: pedidoCreado._id,
        metodo: 'transbank',
        total
      }));

      // Generar la transacción con Transbank
      const ordenCompra = `OC${Date.now()}`;
      const sesionId = `SESION${Date.now()}`;
        const returnUrl = `http://localhost:8080/envio/${pedidoCreado._id}`;
        
      axios.post("http://localhost:3000/api/transbank/crear-transaccion", {
        monto: Math.round(total),
        ordenCompra,
        sesionId,
        returnUrl
      })
      .then(transbankRes => {
        const { url, token } = transbankRes.data;
        if (url && token) {
          window.location.href = `${url}?token_ws=${token}`;
        } else {
          throw new Error("Respuesta de Transbank inválida");
        }
      })
      .catch(error => {
        console.error("Error al procesar el pago:", error);
        alert("Error al iniciar el pago con Transbank.");
      });

    })
    .catch(error => {
      console.error("Error al crear el pedido:", error);
      alert("Ocurrió un error al generar el pedido.");
    });
}


  }
};
</script>


  <style>
  .producto {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 20px;
  }
  
  .producto-imagen {
    width: 100%;
    height: auto;
    margin-bottom: 10px;
  }
  
  .producto-nombre {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .producto-descripcion {
    margin-bottom: 5px;
  }
  
  .producto-categoria {
    margin-bottom: 5px;
  }
  
  .producto-precio {
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .producto-cantidad {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  
  .producto-cantidad-resta,
  .producto-cantidad-suma {
    display: inline-block;
    width: 30px;
    height: 30px;
    border: 10px;
    }



    .notificacion {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  opacity: 0;
  animation: notificacion-fade 0.5s forwards;
}

.notificacion.info {
  background-color: #007bff; /* Azul */
}

.notificacion.error {
  background-color: #dc3545; /* Rojo */
}

@keyframes notificacion-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>