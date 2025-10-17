-- Sample Lab Subjects and Programs for CN, AI, and FSD
-- Run this after creating the lab_subjects and lab_programs tables

-- ============================================
-- LAB SUBJECTS (Metadata)
-- ============================================

INSERT INTO lab_subjects (id, name, code, description, icon) VALUES
('lab-subject-cn', 'Computer Networks', 'cn', 'Network programming, protocols, and socket programming', '🌐'),
('lab-subject-ai', 'Artificial Intelligence', 'ai', 'Search algorithms, AI techniques, and problem solving', '🤖'),
('lab-subject-fsd', 'Full Stack Development-2', 'fsd', 'Web development, APIs, and full stack applications', '💻');

-- ============================================
-- COMPUTER NETWORKS (CN) Programs
-- ============================================

-- CN - Program 1: TCP Client-Server (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'cn-1-tcp-server',
    'cn',
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

-- CN - Program 2: UDP Client (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'cn-2-udp-client',
    'cn',
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

-- CN - Program 3: IP Address Validation (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'cn-3-ip-validation',
    'cn',
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

-- CN - Program 4: Subnet Calculator (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'cn-4-subnet-calc',
    'cn',
    'Subnet Mask Calculator',
    'python',
    'def calculate_subnet(ip, mask):
    ip_parts = list(map(int, ip.split(".")))
    mask_parts = list(map(int, mask.split(".")))
    
    network = [ip_parts[i] & mask_parts[i] for i in range(4)]
    broadcast = [network[i] | (~mask_parts[i] & 255) for i in range(4)]
    
    print(f"IP Address: {ip}")
    print(f"Subnet Mask: {mask}")
    print(f"Network Address: {".".join(map(str, network))}")
    print(f"Broadcast Address: {".".join(map(str, broadcast))}")

ip = input("Enter IP: ")
mask = input("Enter Subnet Mask: ")
calculate_subnet(ip, mask)',
    '192.168.1.10
255.255.255.0',
    'Calculates network and broadcast addresses from IP and subnet mask',
    'medium'
);

-- CN - Program 5: CRC Error Detection (C)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'cn-5-crc',
    'cn',
    'CRC Error Detection',
    'c',
    '#include <stdio.h>
#include <string.h>

void xor_operation(char data[], char divisor[], int divisor_len) {
    for (int i = 1; i < divisor_len; i++) {
        data[i] = (data[i] == divisor[i]) ? ''0'' : ''1'';
    }
}

void crc(char data[], char divisor[]) {
    int data_len = strlen(data);
    int divisor_len = strlen(divisor);
    
    char temp[100];
    strcpy(temp, data);
    
    for (int i = 0; i <= data_len - divisor_len; i++) {
        if (temp[i] == ''1'') {
            for (int j = 0; j < divisor_len; j++) {
                temp[i + j] = (temp[i + j] == divisor[j]) ? ''0'' : ''1'';
            }
        }
    }
    
    printf("CRC Remainder: %s\n", temp + data_len - divisor_len + 1);
}

int main() {
    char data[100], divisor[50];
    
    printf("Enter data bits: ");
    scanf("%s", data);
    printf("Enter divisor: ");
    scanf("%s", divisor);
    
    crc(data, divisor);
    return 0;
}',
    '1101011111
10011',
    'CRC (Cyclic Redundancy Check) error detection algorithm',
    'hard'
);

-- ============================================
-- ARTIFICIAL INTELLIGENCE (AI) Programs
-- ============================================

-- AI - Program 1: Linear Search (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'ai-1-linear-search',
    'ai',
    'Linear Search Algorithm',
    'python',
    'def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Input
n = int(input("Enter number of elements: "))
arr = list(map(int, input("Enter elements: ").split()))
target = int(input("Enter element to search: "))

result = linear_search(arr, target)

if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")',
    '5
10 20 30 40 50
30',
    'Simple linear search algorithm',
    'easy'
);

-- AI - Program 2: Binary Search (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'ai-2-binary-search',
    'ai',
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

# Input
n = int(input("Enter number of elements: "))
arr = list(map(int, input("Enter sorted elements: ").split()))
target = int(input("Enter element to search: "))

result = binary_search(arr, target)

if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")',
    '6
10 20 30 40 50 60
40',
    'Efficient binary search on sorted array',
    'easy'
);

-- AI - Program 3: BFS (Breadth-First Search) (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'ai-3-bfs',
    'ai',
    'BFS Graph Traversal',
    'python',
    'from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# Build graph
graph = {
    ''A'': [''B'', ''C''],
    ''B'': [''A'', ''D'', ''E''],
    ''C'': [''A'', ''F''],
    ''D'': [''B''],
    ''E'': [''B'', ''F''],
    ''F'': [''C'', ''E'']
}

start = input("Enter start node: ")
print("BFS Traversal:", " -> ".join(bfs(graph, start)))',
    'A',
    'Breadth-First Search graph traversal algorithm',
    'medium'
);

-- AI - Program 4: DFS (Depth-First Search) (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'ai-4-dfs',
    'ai',
    'DFS Graph Traversal',
    'python',
    'def dfs(graph, node, visited, result):
    visited.add(node)
    result.append(node)
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, result)
    
    return result

# Build graph
graph = {
    ''A'': [''B'', ''C''],
    ''B'': [''A'', ''D'', ''E''],
    ''C'': [''A'', ''F''],
    ''D'': [''B''],
    ''E'': [''B'', ''F''],
    ''F'': [''C'', ''E'']
}

start = input("Enter start node: ")
visited = set()
result = dfs(graph, start, visited, [])
print("DFS Traversal:", " -> ".join(result))',
    'A',
    'Depth-First Search graph traversal algorithm',
    'medium'
);

-- AI - Program 5: A* Algorithm (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'ai-5-astar',
    'ai',
    'A* Pathfinding Algorithm',
    'python',
    'import heapq

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    while open_set:
        _, current = heapq.heappop(open_set)
        
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            neighbor = (current[0] + dx, current[1] + dy)
            
            if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and grid[neighbor[0]][neighbor[1]] == 0:
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    return None

# Simple grid (0 = free, 1 = obstacle)
grid = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0]
]

start = (0, 0)
goal = (4, 4)
path = astar(grid, start, goal)
print("Path found:", path)',
    '',
    'A* pathfinding algorithm for grid-based navigation',
    'hard'
);

-- ============================================
-- FULL STACK DEVELOPMENT (FSD) Programs
-- ============================================

-- FSD - Program 1: Simple HTTP Server (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'fsd-1-http-server',
    'fsd',
    'Simple HTTP Server',
    'python',
    'from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        
        html = """
        <html>
        <head><title>My Server</title></head>
        <body>
            <h1>Hello from Python HTTP Server!</h1>
            <p>Path: {}</p>
        </body>
        </html>
        """.format(self.path)
        
        self.wfile.write(html.encode())

port = 8000
server = HTTPServer(("localhost", port), SimpleHandler)
print(f"Server running on http://localhost:{port}")
server.serve_forever()',
    '',
    'Basic HTTP server using Python http.server module',
    'easy'
);

-- FSD - Program 2: JSON API Response (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'fsd-2-json-api',
    'fsd',
    'JSON API Response Handler',
    'python',
    'import json

def create_response(status, message, data=None):
    response = {
        "status": status,
        "message": message
    }
    if data:
        response["data"] = data
    return json.dumps(response, indent=2)

# Simulate API requests
users = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
]

# GET /users
print("GET /users:")
print(create_response("success", "Users retrieved", users))

# GET /users/1
print("\nGET /users/1:")
user = next((u for u in users if u["id"] == 1), None)
if user:
    print(create_response("success", "User found", user))
else:
    print(create_response("error", "User not found"))',
    '',
    'JSON API response structure for RESTful services',
    'easy'
);

-- FSD - Program 3: Form Validation (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'fsd-3-form-validation',
    'fsd',
    'Form Validation System',
    'python',
    'import re

def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain a number"
    return True, "Password is valid"

def validate_form(email, password):
    errors = []
    
    if not validate_email(email):
        errors.append("Invalid email format")
    
    is_valid, msg = validate_password(password)
    if not is_valid:
        errors.append(msg)
    
    if errors:
        print("Form validation failed:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("Form validation successful!")
        return True

# Test
email = input("Enter email: ")
password = input("Enter password: ")
validate_form(email, password)',
    'user@example.com
SecurePass123',
    'Form validation for email and password with regex',
    'medium'
);

-- FSD - Program 4: JWT Token Generator (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'fsd-4-jwt-token',
    'fsd',
    'JWT Token Generator (Simplified)',
    'python',
    'import json
import base64
import hashlib

def create_token(payload, secret):
    # Header
    header = {
        "alg": "HS256",
        "typ": "JWT"
    }
    
    # Encode header and payload
    header_encoded = base64.urlsafe_b64encode(
        json.dumps(header).encode()
    ).decode().rstrip("=")
    
    payload_encoded = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).decode().rstrip("=")
    
    # Create signature
    message = f"{header_encoded}.{payload_encoded}"
    signature = hashlib.sha256(
        f"{message}{secret}".encode()
    ).hexdigest()
    
    signature_encoded = base64.urlsafe_b64encode(
        signature.encode()
    ).decode().rstrip("=")
    
    # Combine all parts
    token = f"{header_encoded}.{payload_encoded}.{signature_encoded}"
    return token

# Create token
user_data = {
    "user_id": 123,
    "username": "john_doe",
    "role": "admin"
}

secret_key = "my_secret_key"
token = create_token(user_data, secret_key)
print("JWT Token:")
print(token)',
    '',
    'Simplified JWT token generation for authentication',
    'medium'
);

-- FSD - Program 5: CRUD Operations Simulator (Python)
INSERT INTO lab_programs (id, subject_code, program_name, language, code, sample_input, description, difficulty)
VALUES (
    'fsd-5-crud-simulator',
    'fsd',
    'CRUD Operations Simulator',
    'python',
    'class Database:
    def __init__(self):
        self.records = {}
        self.next_id = 1
    
    def create(self, data):
        id = self.next_id
        self.records[id] = data
        self.next_id += 1
        return {"id": id, **data}
    
    def read(self, id):
        return self.records.get(id)
    
    def read_all(self):
        return [{"id": k, **v} for k, v in self.records.items()]
    
    def update(self, id, data):
        if id in self.records:
            self.records[id].update(data)
            return {"id": id, **self.records[id]}
        return None
    
    def delete(self, id):
        if id in self.records:
            del self.records[id]
            return True
        return False

# Demo
db = Database()

# CREATE
print("Creating records...")
user1 = db.create({"name": "Alice", "age": 25})
user2 = db.create({"name": "Bob", "age": 30})
print("Created:", user1, user2)

# READ
print("\nReading all records:")
print(db.read_all())

# UPDATE
print("\nUpdating user 1...")
updated = db.update(1, {"age": 26})
print("Updated:", updated)

# DELETE
print("\nDeleting user 2...")
db.delete(2)
print("Remaining records:", db.read_all())',
    '',
    'Simulate CRUD operations for database management',
    'medium'
);
