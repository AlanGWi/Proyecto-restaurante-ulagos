<template>
  <Header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <router-link class="navbar-brand fw-bold" to="/">Restaurante</router-link>

        <!-- Botón Hamburguesa -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Menú colapsable -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav me-auto">
            <router-link class="nav-link" to="/">Menú</router-link>
            <router-link v-if="!estaAutenticado" class="nav-link" to="/login">
              Iniciar sesión
            </router-link>
            <router-link v-if="estaAutenticado" class="nav-link" to="/reservas">
              Reservas
            </router-link>
            <router-link
              v-if="rols === 'ADMIN' || rols === 'TRABAJADOR'"
              class="nav-link"
              to="/pedidos"
            >
              Pedidos
            </router-link>
            <router-link v-if="rols === 'ADMIN'" class="nav-link" to="/agregar">
              Productos
            </router-link>
            <router-link v-if="rols === 'ADMIN'" class="nav-link" to="/mesas">
              Mesas
            </router-link>
            <router-link v-if="rols === 'ADMIN'" class="nav-link" to="/estadistica">
              Estadísticas
            </router-link>
             <router-link v-if="rols === 'ADMIN'" class="nav-link" to="/crearAnuncio">
              Anuncios
            </router-link>
            <router-link v-if="rols === 'ADMIN' || rols==='CLIENTE'" class="nav-link" to="/pago">
              Pago
            </router-link>
            
            <router-link v-if="rols === 'ADMIN' || rols==='TRABAJADOR'" class="nav-link" to="/TotalPedidos">
              Sin pagar
            </router-link>
          </div>

          <!-- Perfil y logout -->
          <div class="d-flex align-items-center gap-3">
            <router-link to="/editarUser" class="nav-link">
              <i class="bi bi-person-circle fs-4 text-white"></i>
            </router-link>
            <router-link
              v-if="rols === 'ADMIN' || rols === 'TRABAJADOR' || rols === 'CLIENTE'"
              @click="logout"
              class="nav-link text-danger fw-bold"
              to="/login"
            >
              <i class="bi bi-box-arrow-right"></i> Salir
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </Header>
</template>
<script>
export default {
  name: "AppVue",

  data() {
    return {
      rols: "",
    };
  },

  mounted() {
    this.rols = localStorage.getItem("role");
    console.log(this.rols);
  },

  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("Username");
      localStorage.removeItem("role");
      this.$router.push("/login");
    },
  },

  computed: {
    estaAutenticado() {
      return !!localStorage.getItem("token");
    },
  },
};
</script>

<style>
.navbar-nav .nav-link {
  color: #ffffff;
}
.navbar-nav .nav-link:hover {
  color: #ffd700; /* dorado al pasar el mouse */
}
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}
</style>