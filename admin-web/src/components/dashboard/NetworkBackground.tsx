const NODES = [
    // Fila 0 — y ≈ 12-48 (justo al nivel del topbar)
    { x: 148,  y: 18  }, { x: 380,  y: 32  }, { x: 620,  y: 12  },
    { x: 860,  y: 44  }, { x: 1100, y: 22  }, { x: 1360, y: 38  },

    // Fila 1 — y ≈ 88-138
    { x: 52,   y: 94  }, { x: 272,  y: 122 }, { x: 492,  y: 88  },
    { x: 724,  y: 118 }, { x: 952,  y: 96  }, { x: 1164, y: 132 },
    { x: 1384, y: 104 }, { x: 1552, y: 128 },

    // Fila 2 — y ≈ 208-268
    { x: 130,  y: 214 }, { x: 356,  y: 248 }, { x: 584,  y: 212 },
    { x: 808,  y: 258 }, { x: 1040, y: 222 }, { x: 1268, y: 254 },
    { x: 1480, y: 232 },

    // Fila 3 — y ≈ 328-388
    { x: 68,   y: 334 }, { x: 296,  y: 368 }, { x: 528,  y: 342 },
    { x: 748,  y: 378 }, { x: 978,  y: 348 }, { x: 1196, y: 384 },
    { x: 1420, y: 356 },

    // Fila 4 — y ≈ 448-508
    { x: 182,  y: 454 }, { x: 412,  y: 488 }, { x: 644,  y: 462 },
    { x: 872,  y: 498 }, { x: 1088, y: 468 }, { x: 1316, y: 502 },
    { x: 1528, y: 474 },

    // Fila 5 — y ≈ 568-628
    { x: 96,   y: 574 }, { x: 324,  y: 608 }, { x: 556,  y: 572 },
    { x: 784,  y: 614 }, { x: 1008, y: 588 }, { x: 1236, y: 622 },
    { x: 1456, y: 594 },

    // Fila 6 — y ≈ 688-758
    { x: 210,  y: 694 }, { x: 444,  y: 728 }, { x: 672,  y: 698 },
    { x: 900,  y: 744 }, { x: 1128, y: 708 }, { x: 1352, y: 748 },
];

const MAX_LINK_DISTANCE = 240;

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
            <g opacity="0.11" stroke="#2D3C5E" fill="#2D3C5E">
                {EDGES.map((edge, i) => (
                    <line
                        key={i}
                        x1={edge.x1} y1={edge.y1}
                        x2={edge.x2} y2={edge.y2}
                        strokeWidth="0.75"
                    />
                ))}
                {NODES.map((node, i) => (
                    <circle key={i} cx={node.x} cy={node.y} r="2.8" />
                ))}
            </g>
        </svg>
    );
}
