// --- Global Tab and Solver Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const tabs = [
        { id: 'konigsberg', button: document.getElementById('tab-konigsberg'), content: document.getElementById('konigsberg-solver'), init: initKonigsbergSolver },
        { id: 'maze', button: document.getElementById('tab-maze'), content: document.getElementById('maze-solver'), init: initMazeSolver },
        { id: 'utility', button: document.getElementById('tab-utility'), content: document.getElementById('utility-solver'), init: initUtilitySolver }
    ];
    
    let initialized = {
        konigsberg: false,
        maze: false,
        utility: false
    };

    function switchTab(targetId) {
        tabs.forEach(tab => {
            const isActive = tab.id === targetId;
            tab.button.classList.toggle('active', isActive);
            tab.content.classList.toggle('hidden', !isActive);

            if (isActive && !initialized[tab.id]) {
                tab.init();
                initialized[tab.id] = true;
            }
        });
    }

    tabs.forEach(tab => {
        tab.button.addEventListener('click', () => switchTab(tab.id));
    });

    // Mobile tab switcher
    const mobileTabs = document.getElementById('tabs');
    mobileTabs.addEventListener('change', (e) => {
        const selectedIndex = e.target.selectedIndex;
        switchTab(tabs[selectedIndex].id);
    });

    // Initialize the first tab
    switchTab('konigsberg');
});

// --- 1. Königsberg Bridges Solver ---
function initKonigsbergSolver() {
    const canvas = document.getElementById('konigsberg-canvas');
    // Check if canvas exists (it might not if the tab isn't visible yet, though DOMContentLoaded should handle this)
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    const solveButton = document.getElementById('solve-konigsberg');
    const resetButton = document.getElementById('reset-konigsberg');
    const loadButton = document.getElementById('load-konigsberg');
    const resultDiv = document.getElementById('konigsberg-result');
    const detailsDiv = document.getElementById('konigsberg-details');
    const degreeList = document.getElementById('konigsberg-degree-list');

    let nodes = [];
    let edges = [];
    let nodeId = 0;
    let isDrawing = false;
    let startNode = null;
    let currentMousePos = { x: 0, y: 0 }; // Store current mouse position for drawing temp line

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        draw();
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        ctx.strokeStyle = '#4f46e5'; // indigo-600
        ctx.lineWidth = 4;
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(edge.from.x, edge.from.y);
            ctx.lineTo(edge.to.x, edge.to.y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
            
            // Highlight odd-degree nodes in red after solving
            if (node.degree % 2 !== 0 && node.degree > 0) {
                ctx.fillStyle = '#ef4444'; // red-500
            } else {
                ctx.fillStyle = '#34d399'; // emerald-400
            }
            
            ctx.fill();
            ctx.strokeStyle = '#1f2937'; // gray-800
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw node ID
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, node.x, node.y);
        });

        // Draw potential new edge
        if (isDrawing && startNode) {
            ctx.beginPath();
            ctx.moveTo(startNode.x, startNode.y);
            ctx.lineTo(currentMousePos.x, currentMousePos.y);
            ctx.strokeStyle = '#a5b4fc'; // indigo-300
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getNodeAt(pos) {
        for (const node of nodes) {
            const dx = node.x - pos.x;
            const dy = node.y - pos.y;
            if (dx * dx + dy * dy < 15 * 15) { // 15px radius
                return node;
            }
        }
        return null;
    }

    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(canvas, e);
        const node = getNodeAt(pos);
        if (node) {
            isDrawing = true;
            startNode = node;
        } else {
            nodes.push({ id: nodeId++, x: pos.x, y: pos.y, degree: 0 });
            draw();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        currentMousePos = getMousePos(canvas, e); // Update global mouse pos
        if (isDrawing && startNode) {
            draw(); // Redraw to show the temp line
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDrawing && startNode) {
            const pos = getMousePos(canvas, e);
            const endNode = getNodeAt(pos);
            if (endNode && endNode !== startNode) {
                edges.push({ from: startNode, to: endNode });
                startNode.degree++;
                endNode.degree++;
            }
        }
        isDrawing = false;
        startNode = null;
        draw();
    });

    function solve() {
        let oddDegreeNodes = 0;
        nodes.forEach(node => {
            node.degree = 0; // Recalculate degrees
        });
        edges.forEach(edge => {
            edge.from.degree++;
            edge.to.degree++;
        });

        oddDegreeNodes = nodes.filter(node => node.degree % 2 !== 0).length;

        // Update result display
        resultDiv.innerHTML = '';
        let resultText, resultColor;
        if (edges.length === 0) {
            resultText = 'Draw some nodes and edges first!';
            resultColor = 'bg-gray-100 text-gray-700';
        } else if (oddDegreeNodes === 0) {
            resultText = 'This graph IS an "Eulerian Circuit"! You can start and end at the same point.';
            resultColor = 'bg-green-100 text-green-700';
        } else if (oddDegreeNodes === 2) {
            resultText = 'This graph IS an "Eulerian Path"! You must start at one odd node and end at the other.';
            resultColor = 'bg-yellow-100 text-yellow-700';
        } else {
            resultText = `Impossible! This graph has ${oddDegreeNodes} odd-degree nodes.`;
            resultColor = 'bg-red-100 text-red-700';
        }
        resultDiv.innerHTML = `<p class="text-xl font-medium">${resultText}</p>`;
        resultDiv.className = `p-4 rounded-lg ${resultColor} transition-all`;

        // Update details
        detailsDiv.classList.remove('hidden');
        degreeList.innerHTML = '';
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.textContent = `Node ${node.id}: Degree ${node.degree}`;
            if (node.degree % 2 !== 0) {
                li.classList.add('text-red-600', 'font-bold');
            }
            degreeList.appendChild(li);
        });

        draw(); // Redraw to highlight odd nodes
    }

    function reset() {
        nodes = [];
        edges = [];
        nodeId = 0;
        resultDiv.innerHTML = '<p class="text-xl font-medium text-gray-700">Click "Solve" to analyze your graph.</p>';
        resultDiv.className = 'text-center p-4 rounded-lg bg-gray-100';
        detailsDiv.classList.add('hidden');
        draw();
    }

    function loadClassic() {
        reset();
        const w = canvas.width;
        const h = canvas.height;
        // 4 land masses (nodes)
        const n0 = { id: nodeId++, x: w * 0.2, y: h * 0.5, degree: 0 };
        const n1 = { id: nodeId++, x: w * 0.4, y: h * 0.2, degree: 0 };
        const n2 = { id: nodeId++, x: w * 0.6, y: h * 0.8, degree: 0 };
        const n3 = { id: nodeId++, x: w * 0.8, y: h * 0.5, degree: 0 };
        nodes = [n0, n1, n2, n3];
        // 7 bridges (edges)
        edges = [
            { from: n0, to: n1 },
            { from: n0, to: n1 },
            { from: n0, to: n2 },
            { from: n0, to: n2 },
            { from: n0, to: n3 },
            { from: n1, to: n3 },
            { from: n2, to: n3 }
        ];
        solve(); // Automatically solve and display
    }
    
    solveButton.addEventListener('click', solve);
    resetButton.addEventListener('click', reset);
    loadButton.addEventListener('click', loadClassic);
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// --- 2. Maze Solver ---
function initMazeSolver() {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const solveButton = document.getElementById('solve-maze');
    const resetButton = document.getElementById('reset-maze');
    const explanationButton = document.getElementById('maze-explanation');
    const resultDiv = document.getElementById('maze-result');
    const brushButtons = {
        wall: document.getElementById('brush-wall'),
        start: document.getElementById('brush-start'),
        end: document.getElementById('brush-end')
    };

    const GRID_SIZE = 25;
    const cellSize = canvas.width / GRID_SIZE;
    let grid = [];
    let start = null;
    let end = null;
    let currentBrush = 'wall';
    let isDrawing = false;
    let isSolving = false;
    let lastPaintedCell = null; // --- BUG FIX ---

    const COLORS = {
        empty: '#f8fafc', // gray-50
        wall: '#374151', // gray-700
        start: '#34d399', // emerald-400
        end: '#ef4444', // red-500
        path: '#facc15', // yellow-400
        visited: '#dbeafe' // blue-200
    };

    function createGrid() {
        grid = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            const row = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                row.push({ r, c, type: 'empty' });
            }
            grid.push(row);
        }
        start = null;
        end = null;
        isSolving = false;
    }

    function drawGrid() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = grid[r][c];
                ctx.fillStyle = COLORS[cell.type];
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                
                // Draw grid lines
                ctx.strokeStyle = '#e5e7eb'; // gray-200
                ctx.lineWidth = 1;
                ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }

    function setBrush(brush) {
        currentBrush = brush;
        Object.values(brushButtons).forEach(button => {
            button.classList.remove('border-indigo-500', 'border-4');
            button.classList.add('border-gray-300', 'border-2');
        });
        brushButtons[brush].classList.add('border-indigo-500', 'border-4');
        brushButtons[brush].classList.remove('border-gray-300', 'border-2');
    }

    Object.keys(brushButtons).forEach(brush => {
        brushButtons[brush].addEventListener('click', () => setBrush(brush));
    });

    function getMazeMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (evt.touches) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        } else {
            clientX = evt.clientX;
            clientY = evt.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function getCellFromPos(x, y) {
        const c = Math.floor(x / cellSize);
        const r = Math.floor(y / cellSize);
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            return grid[r][c];
        }
        return null;
    }

    function handleBrushClick(r, c) {
        const cell = grid[r][c];
        
        // Clear old start/end
        if (currentBrush === 'start') {
            if (start) grid[start.r][start.c].type = 'empty';
            start = cell;
        } else if (currentBrush === 'end') {
            if (end) grid[end.r][end.c].type = 'empty';
            end = cell;
        }

        // Don't draw over start/end unless clearing them
        if (cell.type === 'start' && currentBrush !== 'start') start = null;
        if (cell.type === 'end' && currentBrush !== 'end') end = null;

        cell.type = currentBrush;
        drawGrid();
    }

    // --- BUG FIX: Only set isDrawing=true for 'wall' brush ---
    function handleMazeMouseDown(evt) {
        if (isSolving) return;
        const pos = getMazeMousePos(evt);
        const cell = getCellFromPos(pos.x, pos.y);
        if (cell) {
            // --- FIX: Only enable dragging for walls ---
            if (currentBrush === 'wall') {
                isDrawing = true;
            }
            handleBrushClick(cell.r, cell.c);
            lastPaintedCell = cell;
        }
    }

    function handleMazeMouseMove(evt) {
        if (!isDrawing || isSolving || currentBrush !== 'wall') return;
        const pos = getMazeMousePos(evt);
        const cell = getCellFromPos(pos.x, pos.y);
        
        if (cell && (lastPaintedCell === null || cell.r !== lastPaintedCell.r || cell.c !== lastPaintedCell.c)) {
            if (grid[cell.r][cell.c].type === 'empty') {
                handleBrushClick(cell.r, cell.c);
                lastPaintedCell = cell;
            }
        }
    }
    
    // --- BUG FIX: Reset isDrawing and lastPaintedCell ---
    function handleMazeMouseUp() {
        isDrawing = false;
        lastPaintedCell = null;
    }

    canvas.addEventListener('mousedown', handleMazeMouseDown);
    canvas.addEventListener('mousemove', handleMazeMouseMove);
    canvas.addEventListener('mouseup', handleMazeMouseUp);
    canvas.addEventListener('mouseleave', handleMazeMouseUp);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMazeMouseDown(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleMazeMouseMove(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleMazeMouseUp();
    }, { passive: false });


    async function solve() {
        if (!start || !end) {
            setResult('Please place a Start and End node.', 'red');
            return;
        }
        if (isSolving) return;
        isSolving = true;
        setResult('Solving...', 'blue');

        // Reset visited and path
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c].type === 'visited' || grid[r][c].type === 'path') {
                    grid[r][c].type = 'empty';
                }
            }
        }
        drawGrid();

        const queue = [[start.r, start.c]];
        const visited = new Set([`${start.r},${start.c}`]);
        const parent = new Map(); // To reconstruct path

        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E

        let pathFound = false;

        while (queue.length > 0) {
            const [r, c] = queue.shift();
            const cell = grid[r][c];

            if (cell === end) {
                pathFound = true;
                break;
            }

            // Animate the 'visited' cells
            if (cell !== start) {
                cell.type = 'visited';
                drawGrid();
                await new Promise(res => setTimeout(res, 10)); // Animation delay
            }

            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;
                const key = `${nr},${nc}`;

                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE &&
                    !visited.has(key) && grid[nr][nc].type !== 'wall') {
                    
                    visited.add(key);
                    parent.set(key, cell);
                    queue.push([nr, nc]);
                }
            }
        }
        
        if (pathFound) {
            setResult('Shortest Path Found!', 'green');
            let current = end;
            while (current !== start) {
                if(current !== end) current.type = 'path';
                drawGrid();
                await new Promise(res => setTimeout(res, 25));
                const key = `${current.r},${current.c}`;
                current = parent.get(key);
            }
        } else {
            setResult('No Path Found!', 'red');
        }
        isSolving = false;
    }
    
    function reset() {
        createGrid();
        drawGrid();
        setResult('Draw a maze and click "Solve".', 'gray');
        isSolving = false;
    }

    function showExplanation() {
         setResult(`
            <p class="text-lg font-bold text-teal-600 mb-2">How Breadth-First Search (BFS) Works:</p>
            <p class="text-left">
                1. <strong class="text-gray-800">Queue:</strong> BFS starts at the 'Start' node and adds it to a "to-visit" queue.
                <br>
                2. <strong class="text-gray-800">Explore Neighbors:</strong> It visits the first item in the queue (exploring all its neighbors N, S, E, W) and adds valid, unvisited neighbors back to the queue.
                <br>
                3. <strong class="text-gray-800">One Layer at a Time:</strong> It repeats this process, exploring one "layer" of neighbors at a time. This is what you see animated in blue.
                <br>
                4. <strong class="text-gray-800">Shortest Path:</strong> Because it explores layer by layer, the *first time* it finds the 'End' node, it's guaranteed to be the shortest path!
            </p>
        `, 'teal-light');
    }
    
    function setResult(message, color) {
        resultDiv.innerHTML = `<p class="text-xl font-medium">${message}</p>`;
        const colorClasses = {
            red: 'bg-red-100 text-red-700',
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            gray: 'bg-gray-100 text-gray-700',
            'teal-light': 'bg-teal-100 text-teal-700'
        };
        resultDiv.className = `p-4 rounded-lg ${colorClasses[color] || colorClasses['gray']}`;
    }

    solveButton.addEventListener('click', solve);
    resetButton.addEventListener('click', reset);
    explanationButton.addEventListener('click', showExplanation);
    
    createGrid();
    drawGrid();
}

// --- 3. Utility Problem ---
function initUtilitySolver() {
    const canvas = document.getElementById('utility-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resetButton = document.getElementById('reset-utility');
    const explanationButton = document.getElementById('utility-explanation');
    const resultText = document.getElementById('utility-edge-count');
    const resultWhyContent = document.getElementById('utility-result-why');
    
    // --- BUG FIX: Get checkbox and add listener ---
    const allowCrossingCheckbox = document.getElementById('allowCrossingCheckbox');
    let allowCrossing = false;

    allowCrossingCheckbox.addEventListener('change', (e) => {
        allowCrossing = e.target.checked;
        if(allowCrossing) {
            setUtilityResult('Crossing detector disabled! You can now draw the 9th line.', 'yellow');
        } else {
            setUtilityResult(`Crossing detector re-enabled.`, 'gray');
        }
    });

    let nodes = [];
    let edges = [];
    let isDrawing = false;
    let startNode = null;
    let tempLine = { x: 0, y: 0 };

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setupNodes();
        drawUtilityCanvas();
    }

    function setupNodes() {
        nodes = [];
        const w = canvas.width;
        const h = canvas.height;
        
        // Top row (Utilities)
        nodes.push({ id: 0, x: w * 0.25, y: h * 0.2, type: 'utility', name: 'G' });
        nodes.push({ id: 1, x: w * 0.50, y: h * 0.2, type: 'utility', name: 'W' });
        nodes.push({ id: 2, x: w * 0.75, y: h * 0.2, type: 'utility', name: 'E' });
        
        // Bottom row (Houses)
        nodes.push({ id: 3, x: w * 0.25, y: h * 0.8, type: 'house', name: 'H1' });
        nodes.push({ id: 4, x: w * 0.50, y: h * 0.8, type: 'house', name: 'H2' });
        nodes.push({ id: 5, x: w * 0.75, y: h * 0.8, type: 'house', name: 'H3' });
        
        edges = [];
        updateResults();
    }
    
    function drawUtilityCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        ctx.strokeStyle = '#374151'; // gray-700
        ctx.lineWidth = 6;
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(edge.from.x, edge.from.y);
            ctx.lineTo(edge.to.x, edge.to.y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = node.type === 'utility' ? '#f59e0b' : '#10b981'; // amber-500 : emerald-500
            ctx.fill();
            ctx.strokeStyle = '#1f2937'; // gray-800
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.name, node.x, node.y);
        });

        // Draw temp line
        if (isDrawing && startNode) {
            ctx.beginPath();
            ctx.moveTo(startNode.x, startNode.y);
            ctx.lineTo(tempLine.x, tempLine.y);
            ctx.strokeStyle = '#a5b4fc'; // indigo-300
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function getUtilityMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (evt.touches) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        } else {
            clientX = evt.clientX;
            clientY = evt.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function getNodeAt(pos) {
        for (const node of nodes) {
            const dx = node.x - pos.x;
            const dy = node.y - pos.y;
            if (dx * dx + dy * dy < 25 * 25) { // 25px radius
                return node;
            }
        }
        return null;
    }

    // --- Line Intersection Algorithm ---
    function checkIntersection(line1, line2) {
        const p0_x = line1.from.x, p0_y = line1.from.y;
        const p1_x = line1.to.x,   p1_y = line1.to.y;
        const p2_x = line2.from.x, p2_y = line2.from.y;
        const p3_x = line2.to.x,   p3_y = line2.to.y;

        // Check if any endpoint is shared
        if (line1.from === line2.from || line1.from === line2.to ||
            line1.to === line2.from || line1.to === line2.to) {
            return false; // Lines share an endpoint, not a true intersection
        }

        const s1_x = p1_x - p0_x;
        const s1_y = p1_y - p0_y;
        const s2_x = p3_x - p2_x;
        const s2_y = p3_y - p2_y;

        const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        return (s > 0 && s < 1 && t > 0 && t < 1);
    }

    function handleUtilityMouseDown(evt) {
        const pos = getUtilityMousePos(evt);
        const node = getNodeAt(pos);
        if (node) {
            isDrawing = true;
            startNode = node;
            tempLine.x = pos.x;
            tempLine.y = pos.y;
        }
    }
    
    function handleUtilityMouseMove(evt) {
        if (isDrawing && startNode) {
            const pos = getUtilityMousePos(evt);
            tempLine.x = pos.x;
            tempLine.y = pos.y;
            drawUtilityCanvas();
        }
    }

    function handleUtilityMouseUp(evt) {
        if (!isDrawing || !startNode) return;
        
        const pos = getUtilityMousePos(evt);
        const endNode = getNodeAt(pos);

        if (endNode && endNode !== startNode && endNode.type !== startNode.type) {
            const newEdge = { from: startNode, to: endNode };
            
            // --- BUG FIX: Only check for intersection if allowCrossing is false ---
            let intersects = false;
            if (!allowCrossing) {
                for (const edge of edges) {
                    if (checkIntersection(newEdge, edge)) {
                        intersects = true;
                        break;
                    }
                }
            }

            if (intersects) {
                setUtilityResult('Cannot draw line: lines would cross!', 'red');
            } else {
                // Check if edge already exists
                const edgeExists = edges.some(e => 
                    (e.from === startNode && e.to === endNode) ||
                    (e.from === endNode && e.to === startNode)
                );
                if (!edgeExists) {
                    edges.push(newEdge);
                    updateResults();
                }
            }
        }
        
        isDrawing = false;
        startNode = null;
        drawUtilityCanvas();
    }

    function updateResults() {
        resultText.textContent = edges.length;
        if (edges.length === 9) {
            setUtilityResult('You solved it! You must have used the "Trick" mode!', 'green');
        } else if (edges.length === 8) {
            setUtilityResult('You have 8 lines... can you draw the 9th? Check "Trick Mode" if you get stuck.', 'yellow');
        } else {
           resultWhyContent.innerHTML = ''; // Clear old message
        }
    }

    function showExplanation() {
        setUtilityResult(`
            <p class="text-lg font-bold text-purple-600 mb-2">Why is this impossible?</p>
            <p class="text-left">
                This graph ($K_{3,3}$) is "non-planar," meaning it can't be drawn on a flat 2D surface (like this screen) without lines crossing.
                <br><br>
                <strong class="text-gray-800">The Proof:</strong> Think of the first 8 lines. If you draw them in a certain way (like G-H1, G-H2, W-H1, W-H3, E-H2, E-H3), you will find that one house (H3) is "walled off" from one utility (G) by a "cycle" of other lines.
                <br><br>
                <strong class="text-gray-800">The Only "Solutions":</strong>
                <br>
                1. <strong class="text-indigo-600">Use "Trick Mode" (2D):</strong> Draw a line that "cheats" by going around the edge, as you can do here.
                <br>
                2. <strong class="text-indigo-600">Use 3D:</strong> If this was drawn on a 3D shape (like a donut), you could "wrap" the 9th line through the hole to avoid crossing!
            </p>
        `, 'purple-light');
    }
    
    function setUtilityResult(message, color) {
         const colorClasses = {
            red: 'bg-red-100 text-red-700',
            green: 'bg-green-100 text-green-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            gray: 'bg-gray-100 text-gray-700',
            'purple-light': 'bg-purple-100 text-purple-700'
        };
        resultWhyContent.innerHTML = `<div class="p-4 rounded-lg ${colorClasses[color] || colorClasses['gray']}"><p class="font-medium">${message}</p></div>`;
    }

    function resetUtility() {
        edges = [];
        isDrawing = false;
        startNode = null;
        allowCrossingCheckbox.checked = false;
        allowCrossing = false;
        updateResults();
        drawUtilityCanvas();
        setUtilityResult('', 'gray');
        resultText.textContent = "0";
    }
    
    resetButton.addEventListener('click', resetUtility);
    explanationButton.addEventListener('click', showExplanation);

    canvas.addEventListener('mousedown', handleUtilityMouseDown);
    canvas.addEventListener('mousemove', handleUtilityMouseMove);
    canvas.addEventListener('mouseup', handleUtilityMouseUp);
    canvas.addEventListener('mouseleave', handleUtilityMouseUp);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleUtilityMouseDown(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleUtilityMouseMove(e); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleUtilityMouseUp(e); }, { passive: false });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}