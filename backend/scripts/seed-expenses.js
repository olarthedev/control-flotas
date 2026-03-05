const http = require('http');

const base = 'http://127.0.0.1:3001';

function req(path, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(base + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...opts.headers },
    };

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    request.on('error', reject);
    if (opts.body) request.write(opts.body);
    request.end();
  });
}

(async () => {
  try {
    console.log('==== INICIANDO SEEDING DE DATOS ====\n');

    // 1. Crear usuarios conductores
    console.log('1. Creando conductores...');
    const drivers = [];
    const driverData = [
      { fullName: 'Carlos Pérez García', email: 'carlos.perez@example.com', password: 'password123', role: 'DRIVER' },
      { fullName: 'María López Rodríguez', email: 'maria.lopez@example.com', password: 'password123', role: 'DRIVER' },
      { fullName: 'Juan Hernández Martínez', email: 'juan.hernandez@example.com', password: 'password123', role: 'DRIVER' },
    ];

    for (const dData of driverData) {
      try {
        const r = await req('/users', {
          method: 'POST',
          body: JSON.stringify(dData),
        });
        if (r.status === 201) {
          drivers.push(r.body);
          console.log(`   ✓ ${dData.fullName} creado (ID: ${r.body.id})`);
        } else if (r.status === 400) {
          // El usuario ya existe, buscar por email
          const list = await req('/users');
          const existing = list.body.find(u => u.email === dData.email);
          if (existing) {
            drivers.push(existing);
            console.log(`   ✓ ${dData.fullName} ya existe (ID: ${existing.id})`);
          }
        } else {
          console.log(`   ✗ Error creando ${dData.fullName}: ${r.status}`, r.body?.message || '');
        }
      } catch (err) {
        console.log(`   ✗ Error en solicitud: ${err.message}`);
      }
    }

    // Si no hay conductores existentes, intentar usar los primeros
    if (drivers.length === 0) {
      try {
        const list = await req('/users');
        drivers.push(...list.body.slice(0, 3));
        console.log(`   ℹ Usando conductores existentes: ${drivers.map(d => d.fullName).join(', ')}`);
      } catch (err) {
        console.log('\n❌ No se pudieron obtener conductores. Abortando...');
        return;
      }
    }

    // 2. Crear vehículos
    console.log('\n2. Creando vehículos...');
    const vehicles = [];
    const vehicleData = [
      { licensePlate: 'ABC123', brand: 'Mercedes-Benz', model: 'Actros', type: 'Camión', soatExpiryDate: '2026-12-31', technicalReviewExpiryDate: '2026-11-30', insuranceExpiryDate: '2026-10-31' },
      { licensePlate: 'XYZ789', brand: 'Volvo', model: 'FH16', type: 'Camión', soatExpiryDate: '2026-11-30', technicalReviewExpiryDate: '2026-10-31', insuranceExpiryDate: '2026-09-30' },
      { licensePlate: 'DEF456', brand: 'Scania', model: 'R440', type: 'Furgón', soatExpiryDate: '2026-10-31', technicalReviewExpiryDate: '2026-09-30', insuranceExpiryDate: '2026-08-31' },
    ];

    for (const vData of vehicleData) {
      try {
        const r = await req('/vehicles', {
          method: 'POST',
          body: JSON.stringify(vData),
        });
        if (r.status === 201) {
          vehicles.push(r.body);
          console.log(`   ✓ ${vData.licensePlate} creado (ID: ${r.body.id})`);
        } else {
          console.log(`   ✗ Error creando ${vData.licensePlate}: ${r.status}`);
        }
      } catch (err) {
        console.log(`   ✗ Error: ${err.message}`);
      }
    }

    // 3. Crear viajes
    console.log('\n3. Creando viajes...');
    const trips = [];
    const tripData = [
      { tripNumber: 'TRIP001', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), origin: 'Bogotá', destination: 'Medellín', description: 'Transporte de carga general', driverId: drivers[0].id, vehicleId: vehicles[0].id, plannedBudget: 2000000 },
      { tripNumber: 'TRIP002', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), origin: 'Cali', destination: 'Bogotá', description: 'Entrega de mercancía perecedera', driverId: drivers[1].id, vehicleId: vehicles[1].id, plannedBudget: 2500000 },
      { tripNumber: 'TRIP003', startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), origin: 'Barranquilla', destination: 'Santa Marta', description: 'Carga directa', driverId: drivers[2].id, vehicleId: vehicles[2].id, plannedBudget: 1500000 },
    ];

    for (const tData of tripData) {
      try {
        const r = await req('/trips', {
          method: 'POST',
          body: JSON.stringify(tData),
        });
        if (r.status === 201) {
          trips.push(r.body);
          console.log(`   ✓ ${tData.tripNumber} creado (ID: ${r.body.id})`);
        } else {
          console.log(`   ✗ Error creando ${tData.tripNumber}: ${r.status}`);
        }
      } catch (err) {
        console.log(`   ✗ Error: ${err.message}`);
      }
    }

    // 4. Crear gastos en diferentes estados
    console.log('\n4. Creando gastos...');
    const expenses = [];
    const expensesData = [
      { type: 'FUEL', amount: 450000, expenseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'Gasolina #Extra', notes: 'Carga completa de combustible en Bogotá', driverId: drivers[0].id, vehicleId: vehicles[0].id, tripId: trips[0].id },
      { type: 'TOLLS', amount: 120000, expenseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Peajes vía Medellín', notes: 'Peajes pagados en la ruta Bogotá-Medellín', driverId: drivers[0].id, vehicleId: vehicles[0].id, tripId: trips[0].id },
      { type: 'MEALS', amount: 85000, expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Alimentación en ruta', notes: 'Comidas en La Paila', driverId: drivers[0].id, vehicleId: vehicles[0].id, tripId: trips[0].id },
      { type: 'PARKING', amount: 50000, expenseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), description: 'Parqueadero Medellín', notes: 'Estadía de una noche', driverId: drivers[0].id, vehicleId: vehicles[0].id, tripId: trips[0].id },
      { type: 'FUEL', amount: 380000, expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Combustible retorno', notes: 'Diésel para regreso', driverId: drivers[1].id, vehicleId: vehicles[1].id, tripId: trips[1].id },
      { type: 'MAINTENANCE', amount: 250000, expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Cambio de aceite y filtros', notes: 'Mantenimiento preventivo en Cali', driverId: drivers[1].id, vehicleId: vehicles[1].id, tripId: trips[1].id },
      { type: 'LOADING_UNLOADING', amount: 180000, expenseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Costos de cargue y descargue', notes: 'Operarios de cargue en Santa Marta', driverId: drivers[2].id, vehicleId: vehicles[2].id, tripId: trips[2].id },
      { type: 'TOLLS', amount: 95000, expenseDate: new Date().toISOString(), description: 'Peajes ruta costa', notes: 'Peajes vía Santa Marta', driverId: drivers[2].id, vehicleId: vehicles[2].id, tripId: trips[2].id },
      { type: 'MEALS', amount: 65000, expenseDate: new Date().toISOString(), description: 'Comidas', notes: 'Desayuno y almuerzo en ruta', driverId: drivers[2].id, vehicleId: vehicles[2].id, tripId: trips[2].id },
      { type: 'OTHER', amount: 120000, expenseDate: new Date().toISOString(), description: 'Reparación menor de llantas', notes: 'Parcheado de llanta en Barranquilla', driverId: drivers[1].id, vehicleId: vehicles[1].id, tripId: trips[1].id },
    ];

    for (const eData of expensesData) {
      try {
        const r = await req('/expenses', {
          method: 'POST',
          body: JSON.stringify(eData),
        });
        if (r.status === 201) {
          expenses.push(r.body);
          console.log(`   ✓ Gasto ${eData.type} x $${eData.amount.toLocaleString('es-CO')} creado (ID: ${r.body.id})`);
        } else {
          console.log(`   ✗ Error creando gasto ${eData.type}: ${r.status}`, r.body?.message || '');
        }
      } catch (err) {
        console.log(`   ✗ Error: ${err.message}`);
      }
    }

    // 5. Actualizar estados de gastos
    console.log('\n5. Actualizando estados de gastos...');
    if (expenses.length > 0) {
      const updates = [
        { id: expenses[0].id, status: 'APPROVED' },
        { id: expenses[1].id, status: 'APPROVED' },
        { id: expenses[2].id, status: 'PENDING' },
        { id: expenses[3].id, status: 'OBSERVED' },
        { id: expenses[4].id, status: 'APPROVED' },
        { id: expenses[5].id, status: 'REJECTED' },
        { id: expenses[6].id, status: 'PENDING' },
        { id: expenses[7].id, status: 'PENDING' },
        { id: expenses[8].id, status: 'APPROVED' },
        { id: expenses[9].id, status: 'OBSERVED' },
      ];

      for (const update of updates) {
        try {
          const r = await req(`/expenses/${update.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: update.status }),
          });
          if (r.status === 200) {
            console.log(`   ✓ Gasto ${update.id} actualizado a ${update.status}`);
          } else {
            console.log(`   ✗ Error actualizando gasto ${update.id}: ${r.status}`);
          }
        } catch (err) {
          console.log(`   ✗ Error: ${err.message}`);
        }
      }
    }

    // 6. Listar gastos
    console.log('\n6. Listando gastos creados...');
    try {
      const rExpenses = await req('/expenses');
      console.log(`   Total de gastos: ${rExpenses.body.length}`);
      rExpenses.body.slice(0, 5).forEach((exp, i) => {
        console.log(`   ${i + 1}. ID: ${exp.id} | Tipo: ${exp.type} | Monto: $${exp.amount} | Estado: ${exp.status}`);
      });
    } catch (err) {
      console.log(`   ✗ Error listando gastos: ${err.message}`);
    }

    console.log('\n✅ SEEDING COMPLETADO EXITOSAMENTE\n');
    console.log('Ahora puedes ver los datos en el apartado de Gastos de la aplicación.');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error.message);
  }
})();
