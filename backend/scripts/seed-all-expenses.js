const base = 'http://127.0.0.1:3001';

async function req(path, opts) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, body: text };
  }
}

function getRandomDate(vehicleId) {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 15) + 1; // Entre 1 y 15 días atrás
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
}

// Tipos de gastos con montos realistas
const expenseTemplates = [
  { type: 'FUEL', amounts: [180000, 220000, 250000, 190000], description: 'Combustible galones' },
  { type: 'TOLLS', amounts: [45000, 65000, 52000, 58000], description: 'Peajes autopistas' },
  { type: 'MAINTENANCE', amounts: [150000, 300000, 200000], description: 'Mantenimiento preventivo' },
  { type: 'MEALS', amounts: [35000, 45000, 40000, 38000], description: 'Comida/Alimentación' },
  { type: 'PARKING', amounts: [25000, 30000, 28000, 20000], description: 'Parqueadero' },
  { type: 'LOADING_UNLOADING', amounts: [50000, 75000, 60000], description: 'Carga y descarga' },
  { type: 'OTHER', amounts: [15000, 20000, 25000], description: 'Otros gastos' },
];

(async () => {
  try {
    // Primero obtener los vehículos
    console.log('Obteniendo vehículos...');
    const vehiclesRes = await req('/vehicles');
    if (vehiclesRes.status !== 200) {
      console.error('Error obteniendo vehículos:', vehiclesRes);
      return;
    }

    const vehicles = vehiclesRes.body;
    console.log(`Encontrados ${vehicles.length} vehículos\n`);

    // Obtener los conductores
    console.log('Obteniendo conductores...');
    const driversRes = await req('/users?role=DRIVER');
    if (driversRes.status !== 200) {
      console.error('Error obteniendo conductores:', driversRes);
      return;
    }

    const drivers = driversRes.body.filter(u => u.role === 'DRIVER');
    console.log(`Encontrados ${drivers.length} conductores\n`);

    if (vehicles.length === 0 || drivers.length === 0) {
      console.error('Se necesitan vehículos y conductores para crear gastos');
      return;
    }

    // Crear gastos para cada vehículo
    let expenseCount = 0;
    for (const vehicle of vehicles) {
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      
      console.log(`\n--- Creando gastos para vehículo ${vehicle.licensePlate} (ID: ${vehicle.id}) ---`);

      // Crear entre 8-12 gastos por vehículo
      const gastsPerVehicle = Math.floor(Math.random() * 5) + 8;

      for (let i = 0; i < gastsPerVehicle; i++) {
        const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
        const amount = template.amounts[Math.floor(Math.random() * template.amounts.length)];
        const expenseDate = getRandomDate(vehicle.id);

        const expenseData = {
          type: template.type,
          amount: amount,
          expenseDate: expenseDate,
          description: `${template.description} - Vehículo ${vehicle.licensePlate}`,
          notes: `Gasto registrado para el vehículo ${vehicle.brand} ${vehicle.model}`,
          driverId: driver.id,
          vehicleId: vehicle.id,
        };

        const res = await req('/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseData),
        });

        if (res.status === 201) {
          console.log(`✓ ${template.type}: $${amount.toLocaleString('es-CO')} - ${new Date(expenseDate).toLocaleDateString('es-CO')}`);
          expenseCount++;
        } else {
          console.error(`✗ Error creando gasto: ${res.body?.message || res.body}`);
        }

        // Pequeño delay para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n\n✅ Se crearon exitosamente ${expenseCount} gastos en total`);
    console.log('Los datos se cargarán automáticamente en la tabla de gastos');

  } catch (error) {
    console.error('Error:', error);
  }
})();
