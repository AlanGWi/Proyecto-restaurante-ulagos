<template>
  <div>
    <HederViewVue></HederViewVue>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">dias</div>
            <div class="card-body">
              <canvas id="myChartDays" ></canvas> 
            </div>
          </div>
        </div>
      </div>


      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">meses</div>
            <div class="card-body">
              <canvas id="myChartMonths" ></canvas> 
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">años</div>
            <div class="card-body">
              <canvas id="myChartYears" ></canvas> 
            </div>
          </div>
        </div>
      </div>
    

</template>

<script>
import { Chart } from 'chart.js/auto';
import axios from "axios";
import HederViewVue from '@/components/HederView.vue'
export default {
  name: "PedidosGraficaVue",
  components:{
  HederViewVue
},
  data() {
    return {
      title: "Gráfica de pedidos eliminados por día, mes y año",
      chartDays: null,
      chartMonths: null,
      chartYears: null,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {

async fetchData() {
  try {
    const response = await axios.get("http://localhost:3000/api/pagos/ganancias");


    
    const data = response.data;  // data es un array con los objetos agrupados

    // Mapear para etiquetas (YYYY-MM-DD) y valores (totalGanado)
    const dayLabels = data.map(item => {
      const { año, mes, dia } = item._id;
      return `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    });

    const dayValues = data.map(item => item.totalGanado);

    this.createChartDays(dayLabels, dayValues);

    // Para meses y años, puedes agrupar nuevamente o hacer queries separadas en backend
    // Aquí solo un ejemplo simple para meses agrupados:

    // Agrupar ganancias por mes
    const groupedMonths = {};
    data.forEach(item => {
      const { año, mes } = item._id;
      const key = `${año}-${String(mes).padStart(2, '0')}`;
      if (!groupedMonths[key]) groupedMonths[key] = 0;
      groupedMonths[key] += item.totalGanado;
    });

    const monthLabels = Object.keys(groupedMonths).sort();
    const monthValues = monthLabels.map(label => groupedMonths[label]);

    this.createChartMonths(monthLabels, monthValues);

    // Agrupar ganancias por año
    const groupedYears = {};
    data.forEach(item => {
      const { año } = item._id;
      if (!groupedYears[año]) groupedYears[año] = 0;
      groupedYears[año] += item.totalGanado;
    });

    const yearLabels = Object.keys(groupedYears).sort();
    const yearValues = yearLabels.map(label => groupedYears[label]);

    this.createChartYears(yearLabels, yearValues);

  } catch (error) {
    console.error('Error al cargar ganancias:', error);
  }
},
createChartDays(dayLabels, dayValues) {
  // Aquí va el código que crea el gráfico
  const config = {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [{
        label: 'Precios Acumulados por Día',
        data: dayValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  };
   new Chart(
    document.getElementById('myChartDays'),
    config
  );
},
createChartMonths(monthLabels, monthValues) {
  // Aquí va el código que crea el gráfico
  const config = {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Precios Acumulados por meses',
        data: monthValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  };
   new Chart(
    document.getElementById('myChartMonths'),
    config
  );
},

createChartYears(latestYearLabels, latestYearValues) {
  // Aquí va el código que crea el gráfico
  const config = {
    type: 'line',
    data: {
      labels: latestYearLabels,
      datasets: [{
        label: 'Precios Acumulados por años',
        data: latestYearValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  };
   new Chart(
    document.getElementById('myChartYears'),
    config
  );
}

}

}


</script>
  
  <style scoped>
  .card-header {
    background-color: #393636;
    color: rgb(255, 252, 252);
    font-weight: bold;
  }
  .card {
  background-color: #f9f4f4;
  color: #ffffff;
}
  </style>