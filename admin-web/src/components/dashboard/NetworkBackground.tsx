const NODES = [
    { x: 95,   y: 72  }, { x: 268,  y: 144 }, { x: 440,  y: 88  }, { x: 612,  y: 196 },
    { x: 758,  y: 116 }, { x: 920,  y: 178 }, { x: 1068, y: 82  }, { x: 1224, y: 158 },
    { x: 1372, y: 104 }, { x: 1508, y: 194 }, { x: 184,  y: 318 }, { x: 372,  y: 278 },
    { x: 528,  y: 374 }, { x: 696,  y: 296 }, { x: 876,  y: 358 }, { x: 1096, y: 282 },
    { x: 1304, y: 342 }, { x: 1456, y: 318 }, { x: 72,   y: 458 }, { x: 344,  y: 478 },
    { x: 548,  y: 516 }, { x: 796,  y: 456 }, { x: 1004, y: 498 }, { x: 1196, y: 476 },
    { x: 1408, y: 514 }, { x: 158,  y: 596 }, { x: 418,  y: 638 }, { x: 678,  y: 598 },
    { x: 948,  y: 636 }, { x: 1148, y: 598 }, { x: 1388, y: 642 }, { x: 312,  y: 738 },
    { x: 584,  y: 718 }, { x: 854,  y: 752 }, { x: 1100, y: 728 }, { x: 1332, y: 762 },
];

const MAX_LINK_DISTANCE = 220;

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
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g opacity="0.045" stroke="#4B5680" fill="#4B5680">
                {EDGES.map((edge, i) => (
                    <line
                        key={i}
                        x1={edge.x1} y1={edge.y1}
                        x2={edge.x2} y2={edge.y2}
                        strokeWidth="0.8"
                    />
                ))}
                {NODES.map((node, i) => (
                    <circle key={i} cx={node.x} cy={node.y} r="2.5" />
                ))}
            </g>
        </svg>
    );
}
