const base = 'http://127.0.0.1:3000';

async function req(path, opts) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, body: text };
  }
}

(async () => {
  console.log('Creating user...');
  let r = await req('/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: 'Test Driver', email: 'driver1@example.com', password: 'secret', role: 'DRIVER' }) });
  console.log(r);

  console.log('Creating vehicle...');
  r = await req('/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ licensePlate: 'ABC123', brand: 'Mercedes', model: 'Actros', year: 2018, vin: 'VIN123', type: 'Furgon', driverId: 1, soatExpiryDate: '2026-12-31', technicalReviewExpiryDate: '2026-11-30', insuranceExpiryDate: '2026-10-31', currentMileage: 120000 }) });
  console.log(r);

  console.log('Creating trip...');
  r = await req('/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripNumber: 'TRIP001', startDate: new Date().toISOString(), origin: 'Bogota', destination: 'Medellin', description: 'Carga general', driverId: 1, vehicleId: 1, plannedBudget: 1500000 }) });
  console.log(r);

  console.log('Creating consignment...');
  r = await req('/consignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consignmentNumber: 'CNSG001', amount: 2000000, consignmentDate: new Date().toISOString(), driverId: 1, vehicleId: 1, tripId: 1, consignmentNotes: 'Entrega inicial' }) });
  console.log(r);

  console.log('Creating expense...');
  r = await req('/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'FUEL', amount: 300000, expenseDate: new Date().toISOString(), description: 'Combustible', notes: 'Gasolina full', driverId: 1, vehicleId: 1, tripId: 1 }) });
  console.log(r);

  console.log('Listing expenses...');
  r = await req('/expenses');
  console.log(r);

  console.log('Listing consignments...');
  r = await req('/consignments');
  console.log(r);

  console.log('Listing trips...');
  r = await req('/trips');
  console.log(r);

  console.log('Listing vehicles...');
  r = await req('/vehicles');
  console.log(r);

  console.log('Listing users...');
  r = await req('/users');
  console.log(r);

  console.log('Done');
})();
