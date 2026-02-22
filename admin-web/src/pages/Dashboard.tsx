import { useEffect, useState } from 'react';
import axios from 'axios';

interface Counts {
    users: number;
    vehicles: number;
    trips: number;
}

export function Dashboard() {
    const [counts, setCounts] = useState<Counts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ejemplo simple: podrías tener un endpoint en el backend que
        // devuelva varios contadores para el dashboard
        axios
            .get('http://localhost:3000/metrics')
            .then((res) => {
                setCounts(res.data);
            })
            .catch((err) => {
                console.error(err);
                setError('No se pudo cargar la información');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Dashboard</h2>
            {counts ? (
                <ul>
                    <li>Usuarios: {counts.users}</li>
                    <li>Vehículos: {counts.vehicles}</li>
                    <li>Viajes: {counts.trips}</li>
                </ul>
            ) : (
                <p>No hay datos disponibles.</p>
            )}
        </div>
    );
}
