-- Sample Min Code Subjects and Programs
-- Run this after creating the mincode_subjects and mincode_programs tables

-- ============================================
-- MINCODE SUBJECTS (Metadata)
-- ============================================

INSERT INTO mincode_subjects (id, name, code, description, icon) VALUES
('mincode-subject-cn', 'Computer Networks', 'CN', 'Minimal network programming examples', '🌐'),
('mincode-subject-ai', 'Artificial Intelligence', 'AI', 'Essential AI algorithms and techniques', '🤖'),
('mincode-subject-fsd', 'Full Stack Development', 'FSD', 'Quick web development snippets', '💻');

-- ============================================
-- COMPUTER NETWORKS (CN) Min Codes
-- ============================================

-- CN - Min Code 1: TCP Echo Server (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-cn-1-tcp-server',
    'CN',
    'TCP Echo Server',
    'python',
    'import socket

# Create TCP socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(("localhost", 8080))
server_socket.listen(1)

print("Server listening on port 8080...")
conn, addr = server_socket.accept()
print(f"Connected by {addr}")

while True:
    data = conn.recv(1024)
    if not data:
        break
    print(f"Received: {data.decode()}")
    conn.sendall(data)  # Echo back

conn.close()
server_socket.close()',
    '',
    'Simple TCP echo server that receives and sends back messages',
    'easy'
);

-- CN - Min Code 2: UDP Client (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-cn-2-udp-client',
    'CN',
    'UDP Client',
    'python',
    'import socket

# Create UDP socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_address = ("localhost", 9999)

message = input("Enter message to send: ")
client_socket.sendto(message.encode(), server_address)

data, server = client_socket.recvfrom(1024)
print(f"Received from server: {data.decode()}")

client_socket.close()',
    'Hello UDP Server',
    'UDP client that sends messages to a server',
    'easy'
);

-- CN - Min Code 3: IP Address Validator (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-cn-3-ip-validation',
    'CN',
    'IP Address Validator',
    'python',
    'def validate_ip(ip):
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    
    for part in parts:
        if not part.isdigit():
            return False
        num = int(part)
        if num < 0 or num > 255:
            return False
    return True

# Test
ip_address = input("Enter IP address: ")
if validate_ip(ip_address):
    print(f"{ip_address} is a valid IP address")
else:
    print(f"{ip_address} is an invalid IP address")',
    '192.168.1.1',
    'Validates IPv4 address format',
    'easy'
);

-- ============================================
-- ARTIFICIAL INTELLIGENCE (AI) Min Codes
-- ============================================

-- AI - Min Code 1: Linear Search (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-ai-1-linear-search',
    'AI',
    'Linear Search Algorithm',
    'python',
    'def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Test
arr = list(map(int, input("Enter array elements: ").split()))
target = int(input("Enter target: "))

result = linear_search(arr, target)
if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")',
    '5 2 8 1 9 3
8',
    'Basic linear search algorithm',
    'easy'
);

-- AI - Min Code 2: Binary Search (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-ai-2-binary-search',
    'AI',
    'Binary Search Algorithm',
    'python',
    'def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Test (array must be sorted)
arr = sorted(list(map(int, input("Enter sorted array: ").split())))
target = int(input("Enter target: "))

result = binary_search(arr, target)
if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")',
    '1 3 5 7 9 11 13
7',
    'Efficient binary search on sorted array',
    'medium'
);

-- AI - Min Code 3: BFS Graph Traversal (Python)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-ai-3-bfs',
    'AI',
    'Breadth First Search (BFS)',
    'python',
    'from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# Test
graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1],
    5: [2]
}

start_node = int(input("Enter start node: "))
print("BFS Traversal:", bfs(graph, start_node))',
    '0',
    'Breadth-first search graph traversal',
    'medium'
);

-- ============================================
-- FULL STACK DEVELOPMENT (FSD) Min Codes
-- ============================================

-- FSD - Min Code 1: Express Server (JavaScript)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-fsd-1-express-server',
    'FSD',
    'Basic Express Server',
    'javascript',
    'const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/data", (req, res) => {
    res.json({ message: "API Response", status: "success" });
});

app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    res.json({ 
        success: true, 
        user: { name, email } 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});',
    '',
    'Basic Express.js server with routes',
    'easy'
);

-- FSD - Min Code 2: React Component (JavaScript)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-fsd-2-react-component',
    'FSD',
    'React Counter Component',
    'javascript',
    'import React, { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div className="counter">
            <h2>Counter: {count}</h2>
            <div className="buttons">
                <button onClick={() => setCount(count - 1)}>
                    Decrement
                </button>
                <button onClick={() => setCount(0)}>
                    Reset
                </button>
                <button onClick={() => setCount(count + 1)}>
                    Increment
                </button>
            </div>
        </div>
    );
}

export default Counter;',
    '',
    'Simple React counter with state management',
    'easy'
);

-- FSD - Min Code 3: REST API with CRUD (JavaScript)
INSERT INTO mincode_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'mincode-fsd-3-rest-crud',
    'FSD',
    'REST API with CRUD Operations',
    'javascript',
    'const express = require("express");
const app = express();
app.use(express.json());

let users = [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" }
];

// GET - Read all
app.get("/api/users", (req, res) => {
    res.json(users);
});

// GET - Read one
app.get("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

// POST - Create
app.post("/api/users", (req, res) => {
    const newUser = {
        id: users.length + 1,
        ...req.body
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// PUT - Update
app.put("/api/users/:id", (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    
    Object.assign(user, req.body);
    res.json(user);
});

// DELETE - Delete
app.delete("/api/users/:id", (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "User not found" });
    
    users.splice(index, 1);
    res.json({ message: "User deleted" });
});

app.listen(3000, () => console.log("Server running on port 3000"));',
    '',
    'Complete CRUD REST API implementation',
    'medium'
);
