<template>
  <div>
    <HederViewVue />
    <div class="container mt-5">
      <h2 class="mb-4">Editar Usuario</h2>

      <form @submit.prevent="actualizarUsuario">
        <div class="mb-3">
          <label for="username" class="form-label">Nombre de usuario</label>
          <input type="text" id="username" class="form-control" v-model="form.username" required>
        </div>

        <div class="mb-3">
          <label for="correo" class="form-label">Correo</label>
          <input type="email" id="correo" class="form-control" v-model="form.correo" required>
        </div>

        <div class="mb-3">
          <label for="nuevaPassword" class="form-label">Nueva contraseña (opcional)</label>
          <input type="password" id="nuevaPassword" class="form-control" v-model="form.nuevaPassword">
        </div>

        <div class="mb-3">
          <label for="passwordActual" class="form-label">Contraseña actual</label>
          <input type="password" id="passwordActual" class="form-control" v-model="form.passwordActual" required>
        </div>

        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
      </form>

      <button @click="eliminarUsuario" class="btn btn-danger mt-3">Eliminar Cuenta</button>

      <div v-if="mensaje" class="alert mt-3" :class="mensajeTipo">
        {{ mensaje }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import HederViewVue from '@/components/HederView.vue';

export default {
  components: {
    HederViewVue
  },
  data() {
    return {
      form: {
        username: '',
        correo: '',
        nuevaPassword: '',
        passwordActual: ''
      },
      mensaje: '',
      mensajeTipo: ''
    };
  },
  mounted() {
    const userId = localStorage.getItem("id");

    if (userId) {
      axios.get(`http://localhost:3000/api/users/obtenerUser/${userId}`)
        .then(res => {
          this.form.username = res.data.Username;
          this.form.correo = res.data.correo;
        })
        .catch(err => {
          console.error(err);
          this.mensaje = 'Error al cargar los datos del usuario: ' + err;
          this.mensajeTipo = 'alert-danger';
        });
    }
  },
  methods: {
    actualizarUsuario() {
      const userId = localStorage.getItem("id");

      axios.put(`http://localhost:3000/api/users/editusuarios/${userId}`, {
        username: this.form.username,
        correo: this.form.correo,
        nuevaPassword: this.form.nuevaPassword,
        passwordActual: this.form.passwordActual
      })
        .then(res => {
          this.mensaje = res.data.message || 'Usuario actualizado correctamente';
          this.mensajeTipo = 'alert-success';
        })
        .catch(err => {
          const msg = err.response?.data?.message || 'Error al actualizar usuario';
          this.mensaje = msg;
          this.mensajeTipo = 'alert-danger';
        });
    },

    eliminarUsuario() {
      const userId = localStorage.getItem("id");

      if (!this.form.passwordActual) {
        alert("Por favor ingrese su contraseña actual para confirmar la eliminación.");
        return;
      }

      if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        axios.delete(`http://localhost:3000/api/users/usuarios/${userId}`, {
          data: { password: this.form.passwordActual }
        })
          .then(() => {
            alert('Usuario eliminado exitosamente');
            localStorage.clear();
            this.$router.push('/'); // redirecciona al home o login
      })
          .catch(error => {
            console.error(error);
            alert(error.response?.data?.message || 'Error al eliminar el usuario');
          });
      }
    }
  }
};
</script>

<style scoped>
.alert {
  padding: 10px;
}
</style>