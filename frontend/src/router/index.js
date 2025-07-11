import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'

const routes = [

  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  },

  {
    path: '/pedidos',
    name: 'pedidos',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/PedidosMenu.vue')
  },


  {
    path: '/forgot',
    name: 'forgot',
    component: () => import( '../views/LoginForgot.vue')
  },

  {
    path: '/register',
    name: 'register',
    component: () => import( '../views/LoginRegister.vue')
  },

    {
    path: '/editarUser',
    name: 'editarUser',
    component: () => import( '../views/EditarUser.vue')
  },

  {
    path: '/carrito/:ids',
    name: 'carrito',
    component: () => import( '../views/CarritoView.vue')
  },
  {
    path: '/editar/:id',
    name: 'editar',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/EditarMenu.vue')
  },
  {
    path: '/agregar',
    name: 'agregar',
    component: () => import( '../views/AgregarMenu.vue')
  },

  {
    path: '/deshabilitados',
    name: 'deshabilitados',
    component: () => import( '../views/ProDeshabilitados.vue')
  },

  {
    path: '/pago',
    name: 'pago',
    component: () => import( '../views/PagoView.vue')
  },

  
  {
    path: '/confirmacion', // Agregar la nueva ruta para confirmar el pago
    name: 'confirmacion',
    component: () => import('../views/ConfirmacionView.vue')
  },

  {
    path: '/reservas', // Agregar la nueva ruta para confirmar el pago
    name: 'reservas',
    component: () => import('../views/ReservasView.vue')
  },

  {
    path: '/estadistica',
    name: 'estadistica',
    component: () => import( '../views/EstadisticasView.vue')
  },

    {
    path: '/mesas',
    name: 'mesas',
    component: () => import( '../views/MesasView.vue')
  },

     {
    path: '/vermesas',
    name: 'vermesas',
    component: () => import( '../views/VerMesas.vue')
  },

       {
    path: '/EditarReservas',
    name: 'EditarReservas',
    component: () => import( '../views/ModificarReservas.vue')
  },

        {
    path: '/verReservas',
    name: 'verReservas',
    component: () => import( '../views/VerReservas.vue')
  },

       {
    path: '/TotalPedidos',
    name: 'TotalPedidos',
    component: () => import( '../views/TotalPedidosPago.vue')
  },

        {
    path: '/envio/:id',
    name: 'envio',
    component: () => import( '../views/enviosView.vue')
  },
         {
    path: '/Estadoenvio',
    name: 'Estadoenvio',
    component: () => import( '../views/EstadoEnvio.vue')
  },

     {
    path: '/crearAnuncio',
    name: 'crearAnuncio',
    component: () => import( '../views/crearAnuncio.vue')
  },
  
]

const router = createRouter({
  history: createWebHistory(), // Cambiar a createWebHistory
  routes
});

export default router
