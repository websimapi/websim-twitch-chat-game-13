function findPath(startX, startY, endX, endY, map) {
    const openSet = new Set();
    const closedSet = new Set();
    const cameFrom = new Map();

    const gScore = new Map();
    const fScore = new Map();

    const startNode = `${startX},${startY}`;
    const endNode = `${endX},${endY}`;

    gScore.set(startNode, 0);
    fScore.set(startNode, heuristic(startX, startY, endX, endY));
    openSet.add(startNode);

    while (openSet.size > 0) {
        let current = null;
        let lowestFScore = Infinity;

        for (const node of openSet) {
            if (fScore.get(node) < lowestFScore) {
                lowestFScore = fScore.get(node);
                current = node;
            }
        }

        if (current === endNode) {
            return reconstructPath(cameFrom, current);
        }

        openSet.delete(current);
        closedSet.add(current);

        const [currentX, currentY] = current.split(',').map(Number);

        const neighbors = getNeighbors(currentX, currentY, map);

        for (const neighbor of neighbors) {
            const neighborNode = `${neighbor.x},${neighbor.y}`;
            if (closedSet.has(neighborNode)) {
                continue;
            }

            const moveCost = (currentX !== neighbor.x && currentY !== neighbor.y) ? 1.41 : 1;
            const tentativeGScore = gScore.get(current) + moveCost;

            if (!openSet.has(neighborNode)) {
                openSet.add(neighborNode);
            } else if (tentativeGScore >= gScore.get(neighborNode)) {
                continue;
            }

            cameFrom.set(neighborNode, current);
            gScore.set(neighborNode, tentativeGScore);
            fScore.set(neighborNode, gScore.get(neighborNode) + heuristic(neighbor.x, neighbor.y, endX, endY));
        }
    }

    return null; // No path found
}

function heuristic(x1, y1, x2, y2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    // Diagonal distance (Chebyshev distance adapted)
    return (dx + dy) + (1.41 - 2) * Math.min(dx, dy);
}

function getNeighbors(x, y, map) {
    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1 }, // N
        { dx: 1, dy: 0 },  // E
        { dx: 0, dy: 1 },  // S
        { dx: -1, dy: 0 }, // W
        { dx: -1, dy: -1 }, // NW
        { dx: 1, dy: -1 }, // NE
        { dx: 1, dy: 1 },  // SE
        { dx: -1, dy: 1 }  // SW
    ];

    for (const dir of directions) {
        const newX = x + dir.dx;
        const newY = y + dir.dy;

        if (newX >= 0 && newX < map.width && newY >= 0 && newY < map.height && !map.isColliding(newX, newY)) {
            // Check for corner cutting on diagonal moves
            if (Math.abs(dir.dx) === 1 && Math.abs(dir.dy) === 1) {
                if (map.isColliding(x + dir.dx, y) || map.isColliding(x, y + dir.dy)) {
                    continue; // Skip this diagonal neighbor as it cuts a corner
                }
            }
            neighbors.push({ x: newX, y: newY });
        }
    }
    return neighbors;
}

function reconstructPath(cameFrom, current) {
    const totalPath = [{ x: parseInt(current.split(',')[0]), y: parseInt(current.split(',')[1]) }];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        totalPath.unshift({ x: parseInt(current.split(',')[0]), y: parseInt(current.split(',')[1]) });
    }
    // Remove the starting node from the path as the player is already there
    if (totalPath.length > 0) {
        totalPath.shift();
    }
    return totalPath;
}

export { findPath };