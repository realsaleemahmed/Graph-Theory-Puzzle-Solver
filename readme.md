Graph Theory Puzzle Solver

<p align="center">
<img alt="HTML5" src="https://www.google.com/search?q=https://img.shields.io/badge/HTML5-E34F26%3Fstyle%3Dfor-the-badge%26logo%3Dhtml5%26logoColor%3Dwhite"/>
<img alt="CSS3" src="https://www.google.com/search?q=https://img.shields.io/badge/CSS3-1572B6%3Fstyle%3Dfor-the-badge%26logo%3Dcss3%26logoColor%3Dwhite"/>
<img alt="JavaScript" src="https://www.google.com/search?q=https://img.shields.io/badge/JavaScript-F7DF1E%3Fstyle%3Dfor-the-badge%26logo%3Djavascript%26logoColor%3Dblack"/>
<img alt="Tailwind CSS" src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-38B2AC%3Fstyle%3Dfor-the-badge%26logo%3Dtailwind-css%26logoColor%3Dwhite"/>
</p>

An interactive web application designed to solve and visually demonstrate classic graph theory puzzles. This tool provides a hands-on way to understand complex concepts like Eulerian paths, pathfinding algorithms, and graph planarity.

This project is built with plain HTML, CSS (using Tailwind CSS), and JavaScript, with a focus on clear visualization and interactivity.

🚀 Features

This application is split into three separate modules, each tackling a famous graph theory problem.

1. Königsberg Bridges Solver

Concept: Demonstrates Eulerian Paths.

Interactive Canvas: Draw your own graph by adding nodes (land masses) and connecting them with edges (bridges).

Solver: Analyzes your custom graph to determine if an Eulerian Path (cross every bridge once) or Eulerian Circuit (start and end at the same point) is possible.

Visual Feedback: The app explains why a path is or isn't possible by highlighting all nodes with an odd degree.

Classic Example: Includes a button to instantly load the classic, unsolvable "7 Bridges of Königsberg" problem.

2. Maze Solver

Concept: Demonstrates Breadth-First Search (BFS) for pathfinding.

Maze Editor: Draw your own maze on a grid, placing walls, a "Start" node, and an "End" node.

Animated Algorithm: Click "Solve" to watch the BFS algorithm work in real-time. The visualization shows how the algorithm "explores" the grid (visited nodes) one layer at a time.

Shortest Path: Once the "End" is found, the app draws the single shortest path from Start to End.

3. The Utility Problem ($K_{3,3}$)

Concept: Demonstrates Graph Planarity.

Interactive Puzzle: Features the classic $K_{3,3}$ graph (3 utilities and 3 houses).

Intersection Detection: The app actively prevents you from drawing an edge that crosses any existing edge, forcing you to get "stuck" just before solving.

"Trick" Mode: When you get stuck, you can check the "Allow Crossing" box. This disables the intersection detector, allowing you manually to draw the final "impossible" 9th line, demonstrating the "cheat" required to solve it in 2D.

📺 Demo

(This is the perfect place to add screenshots or, even better, a short GIF of each puzzle in action!)

Königsberg Solver:

Maze Solver:

Utility Problem:

🛠️ How to Run

This project is built with plain HTML, CSS, and JavaScript and requires no build step or local server.

Clone this repository (or download the files).

Ensure all three files (index.html, style.css, script.js) are in the same directory.

Open index.html in your favorite web browser.

🗂️ Project Structure

The code is organized for clarity and maintainability:

index.html: The main HTML file containing the page structure, all UI elements, and tab navigation.

style.css: The custom stylesheet for canvas elements and tab navigation.

script.js: All JavaScript logic, separated into a global tab handler and individual init functions for each of the three puzzles.

🔬 Puzzle Explanations

Eulerian Path (Königsberg): A path in a graph that visits every edge exactly once. A graph has an Eulerian path if and only if it has exactly two nodes of odd degree (or zero for a circuit).

BFS (Maze): A pathfinding algorithm that explores neighbor nodes layer by layer. It is guaranteed to find the shortest path in an unweighted graph.

Planarity ($K_{3,3}$): A graph is "planar" if it can be drawn on a 2D plane without any edges crossing. The Utility Problem ($K_{3,3}$) is a famous example of a "non-planar" graph.