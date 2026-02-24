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
            .get('http://localhost:3001/metrics')
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

    if (loading) return <p className="text-center py-4">Cargando...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="max-w-lg mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            {counts ? (
                <ul className="space-y-2">
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
