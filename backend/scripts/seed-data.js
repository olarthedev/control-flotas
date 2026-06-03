const { Client } = require('pg');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'control_flotas',
};

function daysAgo(n, hour = 9) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
}

// Fecha fija en el mes actual para que el dashboard muestre datos reales
function thisMonthDate(dayOfMonth, hour = 9) {
    const d = new Date();
    d.setDate(dayOfMonth);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
}

function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

let seq = 1000;
function uid() { return ++seq; }

async function main() {
    const db = new Client(dbConfig);
    await db.connect();
    console.log('Conectado');

    // Limpia todas las tablas y resetea los IDs sin tocar el esquema
    console.log('Limpiando datos anteriores...');
    await db.query(`
        TRUNCATE TABLE
            evidence, expenses, consignments, trips,
            maintenance_records, document_alerts,
            user_bank_accounts, user_vehicle_history,
            users, vehicles
        RESTART IDENTITY CASCADE
    `);

    const pw = await bcrypt.hash('12345678', 10);

    // =====================================================================
    // VEHICULOS
    // =====================================================================
    console.log('Vehiculos...');
    const vR1 = await db.query(
        `INSERT INTO vehicles (license_plate, brand, model, type, soat_expiry_date, technical_review_expiry_date, insurance_expiry_date, maintenance_spent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        ['WHU-977', 'Chevrolet', 'NPR', 'Furgon',
         daysFromNow(45),
         daysFromNow(-10),  // Revision tecnica VENCIDA
         daysFromNow(180),
         320000],
    );
    const vR2 = await db.query(
        `INSERT INTO vehicles (license_plate, brand, model, type, soat_expiry_date, technical_review_expiry_date, insurance_expiry_date, maintenance_spent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        ['WOT-804', 'Chevrolet', 'NHR', 'Furgon',
         daysFromNow(200),
         daysFromNow(90),
         daysFromNow(20),  // Seguro vence pronto
         185000],
    );
    const vid1 = vR1.rows[0].id;
    const vid2 = vR2.rows[0].id;
    console.log(`  WHU-977 id=${vid1}  |  WOT-804 id=${vid2}`);

    // =====================================================================
    // CONDUCTORES
    // =====================================================================
    console.log('Conductores...');
    const dR1 = await db.query(
        `INSERT INTO users (full_name, email, password, role, monthly_salary, assigned_vehicle_id, is_active, phone, license_number)
         VALUES ($1,$2,$3,'driver',$4,$5,true,'3012345678','B2-123456') RETURNING id`,
        ['Carlos Augusto Torres Garcia', 'carlos.torres@flotas.com', pw, 3000000, vid1],
    );
    const dR2 = await db.query(
        `INSERT INTO users (full_name, email, password, role, monthly_salary, assigned_vehicle_id, is_active, phone, license_number)
         VALUES ($1,$2,$3,'driver',$4,$5,true,'3109876543','B2-654321') RETURNING id`,
        ['Edwin Enrique Lopez Perez', 'edwin.lopez@flotas.com', pw, 2600000, vid2],
    );
    const did1 = dR1.rows[0].id;
    const did2 = dR2.rows[0].id;
    console.log(`  Carlos id=${did1}  |  Edwin id=${did2}`);

    // Historial de asignaciones desde hace 60 dias
    const assignStart = daysAgo(60);
    await db.query(
        `INSERT INTO user_vehicle_history (user_id, vehicle_id, start_date) VALUES ($1,$2,$3),($4,$5,$3)`,
        [did1, vid1, assignStart, did2, vid2],
    );

    // =====================================================================
    // VIAJES
    // =====================================================================
    console.log('Viajes...');
    const tripRows = [
        [uid(), did1, vid1, daysAgo(28,6), daysAgo(25,20), 'Bogota',  'Medellin',    'completed',   600000, 85000,  91250],
        [uid(), did1, vid1, daysAgo(21,6), daysAgo(19,18), 'Bogota',  'Cali',        'completed',   550000, 91250,  96800],
        [uid(), did1, vid1, daysAgo(14,6), daysAgo(12,20), 'Bogota',  'Barranquilla','completed',   700000, 96800,  103100],
        [uid(), did1, vid1, daysAgo(7,6),  daysAgo(5,20),  'Bogota',  'Medellin',    'completed',   600000, 103100, 109200],
        [uid(), did1, vid1, daysAgo(1,6),  null,           'Bogota',  'Pereira',     'in_progress', 500000, 109200, null],
        [uid(), did2, vid2, daysAgo(25,6), daysAgo(23,18), 'Bogota',  'Bucaramanga', 'completed',   580000, 72000,  77500],
        [uid(), did2, vid2, daysAgo(18,6), daysAgo(16,20), 'Bogota',  'Medellin',    'completed',   600000, 77500,  83100],
        [uid(), did2, vid2, daysAgo(11,6), daysAgo(9,18),  'Bogota',  'Cali',        'completed',   550000, 83100,  88400],
        [uid(), did2, vid2, daysAgo(-1,8), null,           'Bogota',  'Villavicencio','planned',    450000, null,   null],
    ];
    for (const [num, drv, veh, s, e, ori, dst, st, bud, sm, em] of tripRows) {
        await db.query(
            `INSERT INTO trips (trip_number, driver_id, vehicle_id, start_date, end_date, origin, destination, status, planned_budget, start_mileage, end_mileage)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [`T-${num}`, drv, veh, s, e, ori, dst, st, bud, sm, em],
        );
    }
    console.log(`  ${tripRows.length} viajes`);

    // =====================================================================
    // CONSIGNACIONES
    // =====================================================================
    console.log('Consignaciones...');
    const conRows = [
        [uid(), 'salary_advance', 1500000, daysAgo(45), did1, vid1, 'closed',  daysAgo(15)],
        [uid(), 'salary_advance', 1500000, daysAgo(30), did1, vid1, 'closed',  daysAgo(1)],
        [uid(), 'salary_advance', 1500000, daysAgo(15), did1, vid1, 'open',    null],
        [uid(), 'salary_advance',  800000, daysAgo(5),  did1, vid1, 'open',    null],
        [uid(), 'salary_advance', 1300000, daysAgo(40), did2, vid2, 'closed',  daysAgo(10)],
        [uid(), 'salary_advance', 1300000, daysAgo(28), did2, vid2, 'closed',  daysAgo(2)],
        [uid(), 'salary_advance', 1300000, daysAgo(12), did2, vid2, 'open',    null],
        [uid(), 'salary_advance',  700000, daysAgo(3),  did2, vid2, 'open',    null],
    ];
    for (const [num, pur, amt, dat, drv, veh, st, cl] of conRows) {
        await db.query(
            `INSERT INTO consignments (consignment_number, purpose, amount, consignment_date, driver_id, vehicle_id, status, closing_date)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [`CON-${num}`, pur, amt, dat, drv, veh, st, cl],
        );
    }
    console.log(`  ${conRows.length} consignaciones`);

    // =====================================================================
    // GASTOS
    // =====================================================================
    console.log('Gastos...');
    const now = new Date().toISOString();

    const expenses = [
        // --- Carlos WHU-977 semanas anteriores (aprobados) ---
        [did1, vid1, 'fuel',        195000, daysAgo(28,7),  'Combustible Bogota-Medellin',    'approved', now, null],
        [did1, vid1, 'toll',         52000, daysAgo(28,9),  'Peajes autopista norte',          'approved', now, null],
        [did1, vid1, 'food',         40000, daysAgo(27,12), 'Almuerzo',                        'approved', now, null],
        [did1, vid1, 'fuel',        172000, daysAgo(26,7),  'Combustible retorno',             'approved', now, null],
        [did1, vid1, 'parking',      30000, daysAgo(25,18), 'Parqueadero Medellin',            'approved', now, null],
        [did1, vid1, 'fuel',        188000, daysAgo(21,7),  'Combustible Bogota-Cali',         'approved', now, null],
        [did1, vid1, 'toll',         48000, daysAgo(21,9),  'Peajes',                          'approved', now, null],
        [did1, vid1, 'lodging',     120000, daysAgo(20,20), 'Hotel Cali',                      'approved', now, null],
        [did1, vid1, 'food',         38000, daysAgo(20,12), 'Almuerzo',                        'approved', now, null],
        [did1, vid1, 'fuel',        165000, daysAgo(19,7),  'Combustible retorno',             'approved', now, null],
        [did1, vid1, 'fuel',        210000, daysAgo(14,7),  'Combustible Bogota-Barranquilla', 'approved', now, null],
        [did1, vid1, 'toll',         68000, daysAgo(14,9),  'Peajes ruta larga',               'approved', now, null],
        [did1, vid1, 'lodging',     140000, daysAgo(13,20), 'Hotel Barranquilla',              'approved', now, null],
        [did1, vid1, 'food',         42000, daysAgo(13,12), 'Almuerzo',                        'approved', now, null],
        [did1, vid1, 'lodging',     130000, daysAgo(12,20), 'Hotel segunda noche',             'approved', now, null],
        [did1, vid1, 'fuel',        190000, daysAgo(12,7),  'Combustible retorno',             'approved', now, null],
        [did1, vid1, 'toll',         55000, daysAgo(12,9),  'Peajes retorno',                  'approved', now, null],
        [did1, vid1, 'fuel',        185000, daysAgo(7,7),   'Combustible Bogota-Medellin',     'approved', now, null],
        [did1, vid1, 'toll',         48000, daysAgo(7,8),   'Peajes',                          'approved', now, null],
        [did1, vid1, 'food',         35000, daysAgo(6,12),  'Almuerzo',                        'approved', now, null],
        [did1, vid1, 'fuel',        162000, daysAgo(5,7),   'Combustible retorno',             'approved', now, null],
        [did1, vid1, 'parking',      28000, daysAgo(5,18),  'Parqueadero',                     'approved', now, null],
        // --- Carlos semana actual ---
        [did1, vid1, 'fuel',        178000, daysAgo(4,7),   'Combustible',                     'approved', now, null],
        [did1, vid1, 'toll',         42000, daysAgo(4,9),   'Peajes',                          'approved', now, null],
        [did1, vid1, 'maintenance',  95000, daysAgo(3,10),  'Cambio de aceite emergencia',     'rejected', now, 'No corresponde a gasto operativo'],
        [did1, vid1, 'fuel',        170000, daysAgo(2,7),   'Combustible',                     'approved', now, null],
        [did1, vid1, 'toll',         38000, daysAgo(2,9),   'Peajes retorno',                  'approved', now, null],
        [did1, vid1, 'food',         30000, daysAgo(1,13),  'Alimentacion',                    'pending',  null, null],
        [did1, vid1, 'fuel',        165000, daysAgo(0,8),   'Combustible ruta actual',         'pending',  null, null],
        // --- Edwin WOT-804 semanas anteriores (aprobados) ---
        [did2, vid2, 'fuel',        165000, daysAgo(25,7),  'Combustible Bogota-Bucaramanga',  'approved', now, null],
        [did2, vid2, 'toll',         45000, daysAgo(25,9),  'Peajes',                          'approved', now, null],
        [did2, vid2, 'food',         32000, daysAgo(24,12), 'Almuerzo',                        'approved', now, null],
        [did2, vid2, 'fuel',        158000, daysAgo(23,7),  'Combustible retorno',             'approved', now, null],
        [did2, vid2, 'fuel',        178000, daysAgo(18,7),  'Combustible Bogota-Medellin',     'approved', now, null],
        [did2, vid2, 'toll',         48000, daysAgo(18,9),  'Peajes',                          'approved', now, null],
        [did2, vid2, 'food',         28000, daysAgo(17,12), 'Almuerzo en ruta',                'approved', now, null],
        [did2, vid2, 'fuel',        155000, daysAgo(16,7),  'Combustible retorno',             'approved', now, null],
        [did2, vid2, 'parking',      20000, daysAgo(16,18), 'Parqueadero',                     'approved', now, null],
        [did2, vid2, 'fuel',        168000, daysAgo(11,7),  'Combustible Bogota-Cali',         'approved', now, null],
        [did2, vid2, 'toll',         42000, daysAgo(11,9),  'Peajes',                          'approved', now, null],
        [did2, vid2, 'lodging',     115000, daysAgo(10,20), 'Hotel Cali',                      'approved', now, null],
        [did2, vid2, 'food',         30000, daysAgo(10,12), 'Almuerzo',                        'approved', now, null],
        [did2, vid2, 'fuel',        150000, daysAgo(9,7),   'Combustible retorno',             'approved', now, null],
        [did2, vid2, 'fuel',        158000, daysAgo(7,7),   'Combustible',                     'approved', now, null],
        [did2, vid2, 'toll',         35000, daysAgo(7,9),   'Peajes',                          'approved', now, null],
        // --- Edwin semana actual ---
        [did2, vid2, 'food',         28000, daysAgo(6,12),  'Almuerzo',                        'approved', now, null],
        [did2, vid2, 'fuel',        145000, daysAgo(5,7),   'Combustible ruta',                'approved', now, null],
        [did2, vid2, 'parking',      22000, daysAgo(5,18),  'Parqueadero',                     'approved', now, null],
        [did2, vid2, 'fuel',        161000, daysAgo(3,7),   'Combustible',                     'approved', now, null],
        [did2, vid2, 'toll',         38000, daysAgo(3,9),   'Peajes autopista',                'approved', now, null],
        [did2, vid2, 'fuel',        152000, daysAgo(1,7),   'Combustible retorno',             'pending',  null, null],
        [did2, vid2, 'food',         25000, daysAgo(1,13),  'Almuerzo',                        'pending',  null, null],
        [did2, vid2, 'fuel',        148000, daysAgo(0,8),   'Combustible hoy',                 'pending',  null, null],
    ];

    for (const [drv, veh, type, amt, dat, desc, st, valAt, rej] of expenses) {
        await db.query(
            `INSERT INTO expenses (type, amount, expense_date, description, status, driver_id, vehicle_id, validated_at, rejection_reason)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [type, amt, dat, desc, st, drv, veh, valAt, rej],
        );
    }
    console.log(`  ${expenses.length} gastos (${expenses.filter(e => e[6]==='pending').length} pendientes)`);

    // =====================================================================
    // MANTENIMIENTOS
    // =====================================================================
    console.log('Mantenimientos...');
    const maintRows = [
        // WHU-977
        [vid1, null,  'preventive', 'Cambio de aceite y filtros',    daysAgo(55,9),  320000, 'FAC-2024-001', 'Lubricantes Colombia', 85000,  'completed', false],
        [vid1, null,  'corrective', 'Reparacion sistema de frenos',  daysAgo(42,10), 580000, 'FAC-2024-015', 'Frenos y Mas',         91200,  'completed', false],
        [vid1, null,  'preventive', 'Revision general 100.000 km',   daysAgo(28,9),  750000, 'FAC-2024-028', 'Taller Chevrolet',     97000,  'completed', true],
        [vid1, did1,  'preventive', 'Cambio de llantas traseras',    daysAgo(14,10), 920000, 'FAC-2024-041', 'Llantas del Sur',      103000, 'completed', false],
        [vid1, null,  'preventive', 'Servicio 110.000 km',           daysAgo(0,9),   320000, null,           'Taller Chevrolet',     109200, 'in_progress', false],
        [vid1, null,  'preventive', 'Revision tecnica periodica',    daysAgo(-7,9),  0,      null,           null,                   null,   'scheduled', false],
        // WOT-804
        [vid2, null,  'preventive', 'Cambio de aceite',              daysAgo(50,9),  185000, 'FAC-2024-005', 'Lubricantes Colombia', 72000,  'completed', false],
        [vid2, null,  'corrective', 'Reparacion alternador',         daysAgo(35,10), 420000, 'FAC-2024-019', 'Electrico Automotriz', 77500,  'completed', false],
        [vid2, null,  'preventive', 'Revision general 80.000 km',    daysAgo(20,9),  380000, 'FAC-2024-033', 'Taller Chevrolet',     83000,  'completed', false],
        [vid2, did2,  'emergency',  'Cambio de bateria en ruta',     daysAgo(8,14),  280000, 'FAC-2024-048', 'Repuestos Express',    86000,  'completed', false],
        [vid2, null,  'preventive', 'Calibracion de frenos',         daysAgo(-3,9),  150000, null,           'Frenos y Mas',         null,   'scheduled', false],
    ];

    for (const [veh, perf, type, title, dat, cost, inv, prov, mil, st, fu] of maintRows) {
        await db.query(
            `INSERT INTO maintenance_records (vehicle_id, performed_by_id, type, title, maintenance_date, cost, invoice_number, provider, mileage, status, requires_follow_up)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [veh, perf, type, title, dat, cost, inv, prov, mil, st, fu],
        );
    }
    console.log(`  ${maintRows.length} registros de mantenimiento`);

    // =====================================================================
    // DATOS DEL MES ACTUAL (para que el dashboard muestre numeros reales)
    // =====================================================================
    console.log('Datos del mes actual...');

    // Consignaciones abiertas este mes
    await db.query(
        `INSERT INTO consignments (consignment_number, purpose, amount, consignment_date, driver_id, vehicle_id, status)
         VALUES ($1,'salary_advance',$2,$3,$4,$5,'open'),($6,'salary_advance',$7,$8,$9,$10,'open')`,
        ['CON-MES-1', 2300000, thisMonthDate(1), did1, vid1,
         'CON-MES-2', 2000000, thisMonthDate(1), did2, vid2],
    );

    // Gastos del mes actual — mix approved/pending
    const currentMonthExpenses = [
        // Carlos - aprobados este mes
        [did1, vid1, 'fuel',    185000, thisMonthDate(1, 7),  'Combustible salida mes',   'approved', now],
        [did1, vid1, 'toll',     48000, thisMonthDate(1, 9),  'Peajes autopista',          'approved', now],
        [did1, vid1, 'food',     35000, thisMonthDate(1, 12), 'Almuerzo',                  'approved', now],
        [did1, vid1, 'fuel',    162000, thisMonthDate(2, 7),  'Combustible retorno',       'approved', now],
        [did1, vid1, 'parking',  28000, thisMonthDate(2, 18), 'Parqueadero',               'approved', now],
        // Carlos - pendientes este mes
        [did1, vid1, 'fuel',    170000, daysAgo(0, 8),  'Combustible hoy',               'pending', null],
        [did1, vid1, 'food',     30000, daysAgo(0, 13), 'Almuerzo hoy',                  'pending', null],
        // Edwin - aprobados este mes
        [did2, vid2, 'fuel',    158000, thisMonthDate(1, 7),  'Combustible',              'approved', now],
        [did2, vid2, 'toll',     35000, thisMonthDate(1, 9),  'Peajes',                   'approved', now],
        [did2, vid2, 'food',     28000, thisMonthDate(1, 12), 'Almuerzo',                 'approved', now],
        [did2, vid2, 'fuel',    145000, thisMonthDate(2, 7),  'Combustible',              'approved', now],
        // Edwin - pendientes este mes
        [did2, vid2, 'fuel',    152000, daysAgo(0, 7),  'Combustible hoy',              'pending', null],
        [did2, vid2, 'food',     25000, daysAgo(0, 13), 'Almuerzo hoy',                 'pending', null],
    ];

    for (const [drv, veh, type, amt, dat, desc, st, valAt] of currentMonthExpenses) {
        const rejReason = null;
        await db.query(
            `INSERT INTO expenses (type, amount, expense_date, description, status, driver_id, vehicle_id, validated_at, rejection_reason)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [type, amt, dat, desc, st, drv, veh, valAt, rejReason],
        );
    }
    console.log(`  ${currentMonthExpenses.length} gastos del mes actual`);

    await db.end();

    console.log('\n=== Seed completado ===');
    console.log('');
    console.log(`Carlos Augusto Torres Garcia  carlos.torres@flotas.com  12345678  WHU-977`);
    console.log(`Edwin Enrique Lopez Perez     edwin.lopez@flotas.com    12345678  WOT-804`);
    console.log('');
    console.log('Gastos pendientes para aprobar: Carlos 2, Edwin 3');
    console.log('WHU-977: revision tecnica VENCIDA | WOT-804: seguro vence en 20 dias');
}

main().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
