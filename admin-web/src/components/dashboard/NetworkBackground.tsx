const NODES = [
    // Superior derecho — 3 nodos (antes 6) → crea un hueco amplio
    { x: 1296, y: 52  }, { x: 1472, y: 22  }, { x: 1548, y: 118 },

    // Superior izquierdo — 2 nodos separados
    { x: 118,  y: 38  }, { x: 338,  y: 94  },

    // Superior centro — 2 nodos con hueco entre ellos y los laterales
    { x: 762,  y: 82  }, { x: 928,  y: 26  },

    // Media alta — variación fuerte de y (sin filas)
    { x: 44,   y: 272 }, { x: 208,  y: 228 }, { x: 166,  y: 348 },
    { x: 412,  y: 202 }, { x: 568,  y: 294 }, { x: 742,  y: 238 },
    { x: 896,  y: 322 }, { x: 1044, y: 252 },

    // Media derecha
    { x: 1222, y: 274 }, { x: 1416, y: 304 }, { x: 1548, y: 238 },

    // Media baja — huecos intencionales
    { x: 82,   y: 472 }, { x: 294,  y: 416 }, { x: 452,  y: 492 },
    { x: 658,  y: 438 }, { x: 828,  y: 484 }, { x: 1008, y: 432 },
    { x: 1172, y: 462 }, { x: 1372, y: 494 }, { x: 1528, y: 448 },

    // Baja — muy dispersa
    { x: 186,  y: 586 }, { x: 516,  y: 562 }, { x: 788,  y: 604 },
    { x: 1108, y: 572 }, { x: 1416, y: 608 },

    // Fondo — mínimo de nodos
    { x: 352,  y: 702 }, { x: 734,  y: 718 }, { x: 1062, y: 694 },
];

const MAX_LINK_DISTANCE = 286;

function buildEdges() {
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
            const dx = NODES[i].x - NODES[j].x;
            const dy = NODES[i].y - NODES[j].y;
            if (Math.sqrt(dx * dx + dy * dy) < MAX_LINK_DISTANCE) {
                edges.push({ x1: NODES[i].x, y1: NODES[i].y, x2: NODES[j].x, y2: NODES[j].y });
            }
        }
    }
    return edges;
}

const EDGES = buildEdges();

export function NetworkBackground() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 1600 800"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g
                className="text-[#243058] dark:text-[#a5b4fc] opacity-[0.13] dark:opacity-[0.45]"
                stroke="currentColor"
                fill="currentColor"
            >
                {EDGES.map((edge, i) => (
                    <line
                        key={i}
                        x1={edge.x1} y1={edge.y1}
                        x2={edge.x2} y2={edge.y2}
                        strokeWidth="0.8"
                    />
                ))}
                {NODES.map((node, i) => (
                    <circle key={i} cx={node.x} cy={node.y} r="2.8" />
                ))}
            </g>
        </svg>
    );
}
