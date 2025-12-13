import { Branch } from '../types/theory.types';

export const theoryData: { branches: Branch[] } = {
  branches: [
    {
      id: 'cse',
      code: 'CSE',
      name: 'Computer Science',
      fullName: 'Computer Science and Engineering',
      icon: '💻',
      color: '#3B82F6',
      description: 'Learn programming, algorithms, and software development',
      semesters: [
        {
          id: 'cse-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: [
            {
              id: 'cse-s1-math1',
              code: 'MA101',
              name: 'Engineering Mathematics - I',
              credits: 4,
              type: 'core',
              description: 'Calculus, Differential Equations, and Linear Algebra',
              units: [
                {
                  id: 'ma101-u1',
                  unitNumber: 1,
                  title: 'Differential Calculus',
                  topics: ['Limits and Continuity', 'Differentiation', 'Applications of Derivatives', 'Mean Value Theorems'],
                  syllabus: 'Limits, Continuity, Differentiation of functions, Successive differentiation, Leibnitz theorem, Partial differentiation, Eulers theorem, Total derivative, Chain rule, Jacobians, Maxima and Minima of functions of two variables.'
                },
                {
                  id: 'ma101-u2',
                  unitNumber: 2,
                  title: 'Integral Calculus',
                  topics: ['Integration Techniques', 'Definite Integrals', 'Multiple Integrals', 'Applications'],
                  syllabus: 'Riemann sums, Fundamental theorem of calculus, Integration by parts, Integration by substitution, Double and Triple integrals, Change of order of integration, Applications to area and volume.'
                },
                {
                  id: 'ma101-u3',
                  unitNumber: 3,
                  title: 'Differential Equations',
                  topics: ['First Order ODEs', 'Higher Order ODEs', 'Linear Differential Equations'],
                  syllabus: 'Differential equations of first order and first degree, Exact, Linear and Bernoulli equations, Higher order linear differential equations with constant coefficients, Method of variation of parameters, Cauchys and Legendres linear equations.'
                },
                {
                  id: 'ma101-u4',
                  unitNumber: 4,
                  title: 'Vector Calculus',
                  topics: ['Vector Functions', 'Gradient', 'Divergence', 'Curl', 'Line Integrals'],
                  syllabus: 'Vector differentiation, Gradient, Divergence and Curl, Directional derivative, Line, Surface and Volume integrals, Greens, Gauss divergence and Stokes theorems.'
                },
                {
                  id: 'ma101-u5',
                  unitNumber: 5,
                  title: 'Linear Algebra',
                  topics: ['Matrices', 'Determinants', 'Eigenvalues', 'Eigenvectors'],
                  syllabus: 'Rank of a matrix, Solution of system of linear equations, Eigenvalues and Eigenvectors, Cayley-Hamilton theorem, Diagonalization of matrices, Quadratic forms.'
                }
              ]
            },
            {
              id: 'cse-s1-physics',
              code: 'PH101',
              name: 'Engineering Physics',
              credits: 4,
              type: 'core',
              description: 'Fundamental concepts of physics for engineering',
              units: [
                {
                  id: 'ph101-u1',
                  unitNumber: 1,
                  title: 'Quantum Mechanics',
                  topics: ['Wave Particle Duality', 'Uncertainty Principle', 'Schrodinger Equation'],
                  syllabus: 'Black body radiation, Photoelectric effect, Compton effect, Matter waves, Wave particle duality, Uncertainty principle, Schrodinger wave equation, Physical significance of wave function, Particle in a box.'
                },
                {
                  id: 'ph101-u2',
                  unitNumber: 2,
                  title: 'Crystal Physics',
                  topics: ['Crystal Structure', 'X-ray Diffraction', 'Crystal Defects'],
                  syllabus: 'Space lattice, Unit cell, Crystal systems, Bravais lattices, Crystal planes, Miller indices, X-ray diffraction, Braggs law, Crystal defects.'
                },
                {
                  id: 'ph101-u3',
                  unitNumber: 3,
                  title: 'Semiconductor Physics',
                  topics: ['Energy Bands', 'Intrinsic & Extrinsic', 'P-N Junction', 'Diodes'],
                  syllabus: 'Energy bands in solids, Intrinsic and extrinsic semiconductors, Carrier concentration, Drift and diffusion currents, P-N junction diode, Zener diode, LED, Solar cell.'
                },
                {
                  id: 'ph101-u4',
                  unitNumber: 4,
                  title: 'Magnetic Materials',
                  topics: ['Magnetic Properties', 'Hysteresis', 'Magnetic Materials'],
                  syllabus: 'Origin of magnetic moment, Diamagnetism, Paramagnetism, Ferromagnetism, Hysteresis, Soft and hard magnetic materials, Applications.'
                },
                {
                  id: 'ph101-u5',
                  unitNumber: 5,
                  title: 'Fiber Optics & Lasers',
                  topics: ['Optical Fibers', 'Fiber Types', 'LASER Principles', 'Applications'],
                  syllabus: 'Principle of optical fiber, Acceptance angle, Numerical aperture, Types of fibers, Applications. LASER - Characteristics, Einsteins coefficients, Population inversion, He-Ne laser, Ruby laser, Applications.'
                }
              ]
            },
            {
              id: 'cse-s1-chem',
              code: 'CH101',
              name: 'Engineering Chemistry',
              credits: 4,
              type: 'core',
              description: 'Basic chemistry concepts for engineering applications',
              units: [
                {
                  id: 'ch101-u1',
                  unitNumber: 1,
                  title: 'Water Technology',
                  topics: ['Water Hardness', 'Softening Methods', 'Boiler Problems'],
                  syllabus: 'Hardness of water, Types of hardness, Units of hardness, Estimation of hardness by EDTA method, Water softening methods, Boiler troubles, Internal water treatment.'
                },
                {
                  id: 'ch101-u2',
                  unitNumber: 2,
                  title: 'Electrochemistry',
                  topics: ['Electrochemical Cells', 'EMF', 'Batteries', 'Corrosion'],
                  syllabus: 'Electrochemical cells, EMF of a cell, Nernst equation, Types of electrodes, Batteries - Primary and secondary cells, Corrosion - Types, Factors affecting corrosion, Prevention methods.'
                },
                {
                  id: 'ch101-u3',
                  unitNumber: 3,
                  title: 'Fuels & Combustion',
                  topics: ['Solid Fuels', 'Liquid Fuels', 'Gaseous Fuels', 'Calorific Value'],
                  syllabus: 'Classification of fuels, Calorific value, HCV and LCV, Solid fuels - Coal analysis, Liquid fuels - Petroleum refining, Gaseous fuels - Natural gas, LPG, CNG, Combustion.'
                },
                {
                  id: 'ch101-u4',
                  unitNumber: 4,
                  title: 'Polymers',
                  topics: ['Polymerization', 'Types of Polymers', 'Properties', 'Applications'],
                  syllabus: 'Polymerization - Addition and condensation, Degree of polymerization, Types of polymers, Properties, Engineering plastics, Conducting polymers, Biodegradable polymers.'
                },
                {
                  id: 'ch101-u5',
                  unitNumber: 5,
                  title: 'Spectroscopy',
                  topics: ['UV-Visible', 'IR Spectroscopy', 'NMR', 'Mass Spectrometry'],
                  syllabus: 'Electromagnetic spectrum, UV-Visible spectroscopy, IR spectroscopy, Functional group identification, NMR spectroscopy, Mass spectrometry basics.'
                }
              ]
            },
            {
              id: 'cse-s1-pps',
              code: 'CS101',
              name: 'Programming for Problem Solving',
              credits: 3,
              type: 'core',
              description: 'Introduction to programming using C language',
              units: [
                {
                  id: 'cs101-u1',
                  unitNumber: 1,
                  title: 'Introduction to Programming',
                  topics: ['Algorithms', 'Flowcharts', 'Problem Solving', 'Program Structure'],
                  syllabus: 'Introduction to computers, Problem solving, Algorithms, Flowcharts, Introduction to C, Structure of C program, Compilation and execution, Variables, Data types, Operators, Expressions.'
                },
                {
                  id: 'cs101-u2',
                  unitNumber: 2,
                  title: 'Control Structures',
                  topics: ['Decision Making', 'Loops', 'Branching', 'Conditional Statements'],
                  syllabus: 'Decision making statements - if, if-else, nested if-else, switch-case, Looping statements - while, do-while, for loops, Nested loops, Break and continue statements, goto statement.'
                },
                {
                  id: 'cs101-u3',
                  unitNumber: 3,
                  title: 'Functions & Arrays',
                  topics: ['Function Definition', 'Function Calls', 'Recursion', 'Arrays', 'Strings'],
                  syllabus: 'Functions - Declaration, Definition, Call, Return values, Parameter passing, Recursion, Arrays - One dimensional, Two dimensional, Multi-dimensional, String handling.'
                },
                {
                  id: 'cs101-u4',
                  unitNumber: 4,
                  title: 'Pointers',
                  topics: ['Pointer Basics', 'Pointer Arithmetic', 'Pointers & Arrays', 'Dynamic Memory'],
                  syllabus: 'Introduction to pointers, Pointer variables, Pointer arithmetic, Pointers and arrays, Pointers and functions, Dynamic memory allocation - malloc, calloc, realloc, free.'
                },
                {
                  id: 'cs101-u5',
                  unitNumber: 5,
                  title: 'Structures & File Handling',
                  topics: ['Structures', 'Unions', 'File Operations', 'File I/O'],
                  syllabus: 'Structures - Declaration, Initialization, Accessing members, Nested structures, Unions, typedef, File handling - Opening, Reading, Writing, Closing files, File operations.'
                }
              ]
            },
            {
              id: 'cse-s1-english',
              code: 'EN101',
              name: 'Professional English',
              credits: 3,
              type: 'core',
              description: 'English communication skills for professional development',
              units: [
                {
                  id: 'en101-u1',
                  unitNumber: 1,
                  title: 'Reading Comprehension',
                  topics: ['Reading Skills', 'Vocabulary', 'Comprehension Techniques'],
                  syllabus: 'Reading strategies, Skimming and scanning, Vocabulary building, Context clues, Main idea and supporting details, Inference and conclusion.'
                },
                {
                  id: 'en101-u2',
                  unitNumber: 2,
                  title: 'Writing Skills',
                  topics: ['Essay Writing', 'Report Writing', 'Letter Writing', 'Email'],
                  syllabus: 'Paragraph writing, Essay types, Report writing formats, Business letters, Email etiquette, Resume and cover letter writing.'
                },
                {
                  id: 'en101-u3',
                  unitNumber: 3,
                  title: 'Oral Communication',
                  topics: ['Presentation Skills', 'Public Speaking', 'Group Discussion'],
                  syllabus: 'Effective presentation techniques, Public speaking skills, Voice modulation, Body language, Group discussion strategies, Interview skills.'
                },
                {
                  id: 'en101-u4',
                  unitNumber: 4,
                  title: 'Grammar & Usage',
                  topics: ['Tenses', 'Articles', 'Prepositions', 'Common Errors'],
                  syllabus: 'Tenses and their usage, Articles, Prepositions, Subject-verb agreement, Common grammatical errors, Sentence structure.'
                },
                {
                  id: 'en101-u5',
                  unitNumber: 5,
                  title: 'Professional Communication',
                  topics: ['Business Communication', 'Meetings', 'Negotiations', 'Workplace Ethics'],
                  syllabus: 'Professional communication etiquette, Meeting protocols, Negotiation skills, Workplace communication, Cross-cultural communication, Professional ethics.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: [
            {
              id: 'cse-s2-math2',
              code: 'MA102',
              name: 'Engineering Mathematics - II',
              credits: 4,
              type: 'core',
              description: 'Advanced mathematics for engineering',
              units: [
                {
                  id: 'ma102-u1',
                  unitNumber: 1,
                  title: 'Complex Numbers',
                  topics: ['Complex Functions', 'Analytic Functions', 'Harmonic Functions'],
                  syllabus: 'Functions of complex variables, Analytic functions, Cauchy-Riemann equations, Harmonic functions, Conformal mapping, Bilinear transformations.'
                },
                {
                  id: 'ma102-u2',
                  unitNumber: 2,
                  title: 'Complex Integration',
                  topics: ['Contour Integration', 'Cauchys Theorem', 'Residue Theorem'],
                  syllabus: 'Line integral, Cauchys integral theorem, Cauchys integral formula, Taylor and Laurent series, Singularities, Residue theorem, Contour integration.'
                },
                {
                  id: 'ma102-u3',
                  unitNumber: 3,
                  title: 'Laplace Transforms',
                  topics: ['Transform Properties', 'Inverse Transform', 'Applications to ODEs'],
                  syllabus: 'Laplace transform, Inverse Laplace transform, Properties, Transforms of derivatives and integrals, Unit step function, Dirac delta function, Convolution theorem, Applications to differential equations.'
                },
                {
                  id: 'ma102-u4',
                  unitNumber: 4,
                  title: 'Fourier Series',
                  topics: ['Periodic Functions', 'Fourier Coefficients', 'Convergence'],
                  syllabus: 'Periodic functions, Fourier series expansion, Half range series, Fourier series for discontinuous functions, Parsevals identity.'
                },
                {
                  id: 'ma102-u5',
                  unitNumber: 5,
                  title: 'Probability & Statistics',
                  topics: ['Probability', 'Random Variables', 'Distributions', 'Sampling'],
                  syllabus: 'Probability axioms, Conditional probability, Bayes theorem, Random variables, Probability distributions, Mean, Variance, Standard deviation, Sampling theory.'
                }
              ]
            },
            {
              id: 'cse-s2-ds',
              code: 'CS102',
              name: 'Data Structures',
              credits: 4,
              type: 'core',
              description: 'Fundamental data structures and algorithms',
              units: [
                {
                  id: 'cs102-u1',
                  unitNumber: 1,
                  title: 'Introduction & Arrays',
                  topics: ['Basic Concepts', 'Arrays', 'Complexity Analysis', 'Searching & Sorting'],
                  syllabus: 'Introduction to data structures, Abstract Data Types, Array operations, Time and Space complexity, Searching algorithms - Linear, Binary search, Sorting algorithms - Bubble, Selection, Insertion sort.'
                },
                {
                  id: 'cs102-u2',
                  unitNumber: 2,
                  title: 'Stacks & Queues',
                  topics: ['Stack Operations', 'Queue Operations', 'Applications', 'Circular Queue'],
                  syllabus: 'Stack - Array and linked implementation, Applications, Expression evaluation, Queue - Types of queues, Circular queue, Priority queue, Dequeue, Applications.'
                },
                {
                  id: 'cs102-u3',
                  unitNumber: 3,
                  title: 'Linked Lists',
                  topics: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Applications'],
                  syllabus: 'Linked list concept, Singly linked list operations, Circular linked list, Doubly linked list, Applications of linked lists, Polynomial manipulation.'
                },
                {
                  id: 'cs102-u4',
                  unitNumber: 4,
                  title: 'Trees',
                  topics: ['Binary Trees', 'BST', 'Tree Traversals', 'AVL Trees', 'Heaps'],
                  syllabus: 'Tree terminology, Binary tree, Binary tree traversals, Binary Search Tree, AVL trees, B-trees, Heaps, Heap sort, Priority queues.'
                },
                {
                  id: 'cs102-u5',
                  unitNumber: 5,
                  title: 'Graphs & Hashing',
                  topics: ['Graph Representation', 'Graph Traversals', 'Hash Tables', 'Collision Resolution'],
                  syllabus: 'Graph representation, Graph traversals - BFS, DFS, Spanning trees, Shortest path algorithms, Hashing - Hash functions, Collision resolution techniques, Applications.'
                }
              ]
            },
            {
              id: 'cse-s2-python',
              code: 'CS103',
              name: 'Python Programming',
              credits: 3,
              type: 'core',
              description: 'Programming with Python language',
              units: [
                {
                  id: 'cs103-u1',
                  unitNumber: 1,
                  title: 'Python Basics',
                  topics: ['Introduction', 'Variables', 'Data Types', 'Operators', 'Control Flow'],
                  syllabus: 'Introduction to Python, Variables and data types, Operators, Input/output, Control structures - if, loops, break, continue, pass statements.'
                },
                {
                  id: 'cs103-u2',
                  unitNumber: 2,
                  title: 'Data Structures in Python',
                  topics: ['Lists', 'Tuples', 'Sets', 'Dictionaries', 'Strings'],
                  syllabus: 'Lists - Operations, List comprehension, Tuples, Sets, Dictionaries, String manipulation, Regular expressions.'
                },
                {
                  id: 'cs103-u3',
                  unitNumber: 3,
                  title: 'Functions & Modules',
                  topics: ['Functions', 'Lambda', 'Modules', 'Packages', 'Exception Handling'],
                  syllabus: 'Functions - Definition, Arguments, Return values, Lambda functions, Recursion, Modules and packages, Exception handling, File operations.'
                },
                {
                  id: 'cs103-u4',
                  unitNumber: 4,
                  title: 'Object-Oriented Programming',
                  topics: ['Classes', 'Objects', 'Inheritance', 'Polymorphism', 'Encapsulation'],
                  syllabus: 'Classes and objects, Constructors, Inheritance - Single, Multiple, Multilevel, Polymorphism, Encapsulation, Operator overloading.'
                },
                {
                  id: 'cs103-u5',
                  unitNumber: 5,
                  title: 'Advanced Python',
                  topics: ['GUI Programming', 'Database', 'Web Scraping', 'Libraries'],
                  syllabus: 'GUI programming with Tkinter, Database connectivity, Web scraping, NumPy basics, Pandas basics, Matplotlib basics.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: [
            {
              id: 'cse-s3-dbms',
              code: 'CS201',
              name: 'Database Management Systems',
              credits: 4,
              type: 'core',
              description: 'Database design, SQL, and transaction management',
              units: [
                {
                  id: 'cs201-u1',
                  unitNumber: 1,
                  title: 'Introduction to DBMS',
                  topics: ['Database Concepts', 'DBMS Architecture', 'Data Models', 'ER Diagrams'],
                  syllabus: 'Database system concepts, Data models, Database architecture, Entity-Relationship model, ER diagrams, Extended ER features, Relational model.'
                },
                {
                  id: 'cs201-u2',
                  unitNumber: 2,
                  title: 'SQL',
                  topics: ['DDL', 'DML', 'Queries', 'Joins', 'Subqueries'],
                  syllabus: 'SQL basics, DDL commands, DML commands, Queries, Aggregate functions, Joins, Nested queries, Views, Indexes.'
                },
                {
                  id: 'cs201-u3',
                  unitNumber: 3,
                  title: 'Normalization',
                  topics: ['Functional Dependencies', 'Normal Forms', 'Decomposition'],
                  syllabus: 'Functional dependencies, Armstrong axioms, Normal forms - 1NF, 2NF, 3NF, BCNF, 4NF, Decomposition, Lossless join, Dependency preservation.'
                },
                {
                  id: 'cs201-u4',
                  unitNumber: 4,
                  title: 'Transactions',
                  topics: ['ACID Properties', 'Concurrency Control', 'Deadlock', 'Recovery'],
                  syllabus: 'Transaction concept, ACID properties, Concurrency control, Locking protocols, Deadlock handling, Recovery techniques, Log-based recovery.'
                },
                {
                  id: 'cs201-u5',
                  unitNumber: 5,
                  title: 'Advanced Topics',
                  topics: ['PL/SQL', 'Triggers', 'Stored Procedures', 'NoSQL'],
                  syllabus: 'PL/SQL basics, Triggers, Stored procedures, Cursors, NoSQL databases, MongoDB basics, Database security.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: [
            {
              id: 'cse-s4-os',
              code: 'CS202',
              name: 'Operating Systems',
              credits: 4,
              type: 'core',
              description: 'Operating system concepts and design',
              units: [
                {
                  id: 'cs202-u1',
                  unitNumber: 1,
                  title: 'Introduction to OS',
                  topics: ['OS Concepts', 'OS Structure', 'System Calls', 'OS Services'],
                  syllabus: 'Operating system concepts, OS services, System calls, OS structure, Virtual machines, System boot process.'
                },
                {
                  id: 'cs202-u2',
                  unitNumber: 2,
                  title: 'Process Management',
                  topics: ['Processes', 'Threads', 'CPU Scheduling', 'Synchronization'],
                  syllabus: 'Process concept, Process scheduling, Operations on processes, Threads, CPU scheduling algorithms, Process synchronization, Critical section problem, Semaphores, Monitors.'
                },
                {
                  id: 'cs202-u3',
                  unitNumber: 3,
                  title: 'Deadlocks',
                  topics: ['Deadlock Characterization', 'Prevention', 'Avoidance', 'Detection', 'Recovery'],
                  syllabus: 'Deadlock problem, Deadlock characterization, Deadlock prevention, Deadlock avoidance, Deadlock detection, Recovery from deadlock.'
                },
                {
                  id: 'cs202-u4',
                  unitNumber: 4,
                  title: 'Memory Management',
                  topics: ['Memory Allocation', 'Paging', 'Segmentation', 'Virtual Memory'],
                  syllabus: 'Memory management, Swapping, Contiguous allocation, Paging, Segmentation, Virtual memory, Demand paging, Page replacement algorithms.'
                },
                {
                  id: 'cs202-u5',
                  unitNumber: 5,
                  title: 'File Systems & I/O',
                  topics: ['File Concept', 'File Organization', 'Directory Structure', 'Disk Management'],
                  syllabus: 'File concept, File operations, Directory structure, File system structure, File allocation methods, Disk structure, Disk scheduling algorithms, I/O systems.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: [
            {
              id: 'cse-s5-cn',
              code: 'CS301',
              name: 'Computer Networks',
              credits: 4,
              type: 'core',
              description: 'Network protocols, architecture, and communication',
              units: [
                {
                  id: 'cs301-u1',
                  unitNumber: 1,
                  title: 'Introduction to Networks',
                  topics: ['Network Basics', 'OSI Model', 'TCP/IP', 'Network Topologies'],
                  syllabus: 'Computer network basics, Network topologies, OSI reference model, TCP/IP model, Network protocols, Network types - LAN, MAN, WAN.'
                },
                {
                  id: 'cs301-u2',
                  unitNumber: 2,
                  title: 'Data Link Layer',
                  topics: ['Framing', 'Error Detection', 'Error Correction', 'MAC Protocols'],
                  syllabus: 'Data link layer design, Framing, Error detection and correction codes, Elementary data link protocols, Sliding window protocols, MAC sublayer, Channel allocation, Multiple access protocols, Ethernet, Wireless LANs.'
                },
                {
                  id: 'cs301-u3',
                  unitNumber: 3,
                  title: 'Network Layer',
                  topics: ['Routing Algorithms', 'IP Addressing', 'Subnetting', 'NAT'],
                  syllabus: 'Network layer services, Routing algorithms, IP addressing, Subnetting, CIDR, NAT, IPv4, IPv6, ICMP, ARP, RARP.'
                },
                {
                  id: 'cs301-u4',
                  unitNumber: 4,
                  title: 'Transport Layer',
                  topics: ['TCP', 'UDP', 'Flow Control', 'Congestion Control'],
                  syllabus: 'Transport layer services, Port addressing, UDP, TCP, Connection establishment, Flow control, Congestion control, TCP congestion control algorithms.'
                },
                {
                  id: 'cs301-u5',
                  unitNumber: 5,
                  title: 'Application Layer',
                  topics: ['HTTP', 'FTP', 'SMTP', 'DNS', 'Network Security'],
                  syllabus: 'Application layer protocols - HTTP, FTP, SMTP, POP3, IMAP, DNS, DHCP, Network security basics, Cryptography, Firewalls, VPN.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: [
            {
              id: 'cse-s6-se',
              code: 'CS302',
              name: 'Software Engineering',
              credits: 4,
              type: 'core',
              description: 'Software development lifecycle and methodologies',
              units: [
                {
                  id: 'cs302-u1',
                  unitNumber: 1,
                  title: 'Software Process',
                  topics: ['SDLC Models', 'Waterfall', 'Agile', 'Spiral'],
                  syllabus: 'Software engineering fundamentals, Software process models - Waterfall, Incremental, Evolutionary, Spiral, Agile methodologies, Process improvement.'
                },
                {
                  id: 'cs302-u2',
                  unitNumber: 2,
                  title: 'Requirements Engineering',
                  topics: ['Requirements Elicitation', 'Analysis', 'Specification', 'Validation'],
                  syllabus: 'Requirements engineering, Functional and non-functional requirements, Requirements elicitation, Requirements analysis, Requirements specification, Requirements validation, Requirements management.'
                },
                {
                  id: 'cs302-u3',
                  unitNumber: 3,
                  title: 'System Design',
                  topics: ['Architectural Design', 'Design Patterns', 'UML Diagrams'],
                  syllabus: 'System design concepts, Architectural design, Design patterns, UML diagrams - Use case, Class, Sequence, Activity, State diagrams, Component and deployment diagrams.'
                },
                {
                  id: 'cs302-u4',
                  unitNumber: 4,
                  title: 'Testing',
                  topics: ['Testing Strategies', 'Unit Testing', 'Integration Testing', 'System Testing'],
                  syllabus: 'Software testing fundamentals, Testing strategies, Unit testing, Integration testing, System testing, Acceptance testing, White box and black box testing, Test case design.'
                },
                {
                  id: 'cs302-u5',
                  unitNumber: 5,
                  title: 'Project Management',
                  topics: ['Project Planning', 'Risk Management', 'Quality Management', 'Maintenance'],
                  syllabus: 'Software project management, Project planning, Risk management, Quality management, Configuration management, Software maintenance, Software metrics.'
                }
              ]
            }
          ]
        },
        {
          id: 'cse-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: [
            {
              id: 'cse-s7-ml',
              code: 'CS401',
              name: 'Machine Learning',
              credits: 4,
              type: 'core',
              description: 'Introduction to machine learning algorithms and applications',
              units: [
                {
                  id: 'cs401-u1',
                  unitNumber: 1,
                  title: 'Introduction to ML',
                  topics: ['ML Basics', 'Types of Learning', 'Data Preprocessing'],
                  syllabus: 'Introduction to machine learning, Types of learning - Supervised, Unsupervised, Reinforcement learning, Data preprocessing, Feature engineering, Train-test split.'
                },
                {
                  id: 'cs401-u2',
                  unitNumber: 2,
                  title: 'Supervised Learning',
                  topics: ['Regression', 'Classification', 'Decision Trees', 'SVM'],
                  syllabus: 'Linear regression, Logistic regression, Decision trees, Random forests, Support Vector Machines, K-Nearest Neighbors, Naive Bayes classifier.'
                },
                {
                  id: 'cs401-u3',
                  unitNumber: 3,
                  title: 'Unsupervised Learning',
                  topics: ['Clustering', 'K-Means', 'Hierarchical Clustering', 'Dimensionality Reduction'],
                  syllabus: 'Clustering algorithms - K-means, Hierarchical clustering, DBSCAN, Dimensionality reduction - PCA, t-SNE, Association rule learning.'
                },
                {
                  id: 'cs401-u4',
                  unitNumber: 4,
                  title: 'Neural Networks',
                  topics: ['Perceptron', 'Backpropagation', 'Deep Learning Basics', 'CNNs'],
                  syllabus: 'Neural networks basics, Perceptron, Multi-layer perceptron, Backpropagation, Activation functions, Deep learning introduction, Convolutional Neural Networks basics.'
                },
                {
                  id: 'cs401-u5',
                  unitNumber: 5,
                  title: 'Advanced Topics',
                  topics: ['Ensemble Methods', 'Model Evaluation', 'Hyperparameter Tuning'],
                  syllabus: 'Ensemble methods - Bagging, Boosting, Stacking, Model evaluation metrics, Cross-validation, Hyperparameter tuning, Overfitting and underfitting, Regularization.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ece',
      code: 'ECE',
      name: 'Electronics',
      fullName: 'Electronics and Communication Engineering',
      icon: '📡',
      color: '#10B981',
      description: 'Study electronics, communications, and signal processing',
      semesters: [
        {
          id: 'ece-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: [
            {
              id: 'ece-s1-math1',
              code: 'MA101',
              name: 'Engineering Mathematics - I',
              credits: 4,
              type: 'core',
              description: 'Calculus, Differential Equations, and Linear Algebra',
              units: [
                {
                  id: 'ece-ma101-u1',
                  unitNumber: 1,
                  title: 'Differential Calculus',
                  topics: ['Limits', 'Continuity', 'Differentiation', 'Applications'],
                  syllabus: 'Limits, Continuity, Differentiation of functions, Successive differentiation, Leibnitz theorem, Partial differentiation, Eulers theorem, Total derivative, Maxima and Minima.'
                },
                {
                  id: 'ece-ma101-u2',
                  unitNumber: 2,
                  title: 'Integral Calculus',
                  topics: ['Integration', 'Definite Integrals', 'Multiple Integrals'],
                  syllabus: 'Integration techniques, Definite integrals, Double and Triple integrals, Change of order of integration, Applications to area and volume.'
                },
                {
                  id: 'ece-ma101-u3',
                  unitNumber: 3,
                  title: 'Differential Equations',
                  topics: ['First Order ODEs', 'Higher Order ODEs', 'Applications'],
                  syllabus: 'First order differential equations, Linear differential equations with constant coefficients, Method of variation of parameters, Applications.'
                },
                {
                  id: 'ece-ma101-u4',
                  unitNumber: 4,
                  title: 'Vector Calculus',
                  topics: ['Vector Functions', 'Gradient', 'Divergence', 'Curl'],
                  syllabus: 'Vector differentiation, Gradient, Divergence and Curl, Line integrals, Greens theorem, Stokes theorem, Gauss divergence theorem.'
                },
                {
                  id: 'ece-ma101-u5',
                  unitNumber: 5,
                  title: 'Matrices',
                  topics: ['Matrix Operations', 'Eigenvalues', 'Diagonalization'],
                  syllabus: 'Rank of matrix, Solution of linear equations, Eigenvalues and eigenvectors, Cayley-Hamilton theorem, Diagonalization.'
                }
              ]
            },
            {
              id: 'ece-s1-physics',
              code: 'PH101',
              name: 'Engineering Physics',
              credits: 4,
              type: 'core',
              description: 'Fundamental physics concepts for engineering',
              units: [
                {
                  id: 'ece-ph101-u1',
                  unitNumber: 1,
                  title: 'Wave Optics',
                  topics: ['Interference', 'Diffraction', 'Polarization'],
                  syllabus: 'Interference - Youngs double slit experiment, Diffraction - Single slit, Double slit, Diffraction grating, Polarization of light.'
                },
                {
                  id: 'ece-ph101-u2',
                  unitNumber: 2,
                  title: 'Lasers & Fiber Optics',
                  topics: ['LASER Principles', 'Types of Lasers', 'Optical Fibers'],
                  syllabus: 'LASER - Characteristics, Einsteins coefficients, Population inversion, Types of lasers, Optical fibers - Principle, Types, Applications.'
                },
                {
                  id: 'ece-ph101-u3',
                  unitNumber: 3,
                  title: 'Quantum Mechanics',
                  topics: ['Wave-Particle Duality', 'Uncertainty Principle', 'Schrodinger Equation'],
                  syllabus: 'Black body radiation, Photoelectric effect, Compton effect, De Broglie hypothesis, Uncertainty principle, Schrodinger equation.'
                },
                {
                  id: 'ece-ph101-u4',
                  unitNumber: 4,
                  title: 'Semiconductor Physics',
                  topics: ['Energy Bands', 'Semiconductors', 'P-N Junction', 'Devices'],
                  syllabus: 'Energy bands in solids, Intrinsic and extrinsic semiconductors, P-N junction diode, Zener diode, LED, Solar cell, Transistors.'
                },
                {
                  id: 'ece-ph101-u5',
                  unitNumber: 5,
                  title: 'Magnetic & Dielectric Materials',
                  topics: ['Magnetism', 'Magnetic Materials', 'Dielectrics', 'Capacitors'],
                  syllabus: 'Magnetic properties, Dia, para, and ferromagnetism, Magnetic materials, Dielectric properties, Polarization, Capacitors.'
                }
              ]
            }
          ]
        },
        {
          id: 'ece-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: []
        },
        {
          id: 'ece-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: []
        },
        {
          id: 'ece-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: []
        },
        {
          id: 'ece-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: []
        },
        {
          id: 'ece-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: []
        },
        {
          id: 'ece-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: []
        }
      ]
    },
    {
      id: 'eee',
      code: 'EEE',
      name: 'Electrical',
      fullName: 'Electrical and Electronics Engineering',
      icon: '⚡',
      color: '#F59E0B',
      description: 'Learn electrical systems, power, and control',
      semesters: [
        {
          id: 'eee-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: []
        },
        {
          id: 'eee-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: []
        },
        {
          id: 'eee-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: []
        },
        {
          id: 'eee-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: []
        },
        {
          id: 'eee-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: []
        },
        {
          id: 'eee-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: []
        },
        {
          id: 'eee-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: []
        }
      ]
    },
    {
      id: 'civil',
      code: 'CIVIL',
      name: 'Civil',
      fullName: 'Civil Engineering',
      icon: '🏗️',
      color: '#8B5CF6',
      description: 'Design and build infrastructure and structures',
      semesters: [
        {
          id: 'civil-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: []
        },
        {
          id: 'civil-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: []
        },
        {
          id: 'civil-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: []
        },
        {
          id: 'civil-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: []
        },
        {
          id: 'civil-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: []
        },
        {
          id: 'civil-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: []
        },
        {
          id: 'civil-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: []
        }
      ]
    },
    {
      id: 'mech',
      code: 'MECH',
      name: 'Mechanical',
      fullName: 'Mechanical Engineering',
      icon: '⚙️',
      color: '#EF4444',
      description: 'Study mechanics, thermodynamics, and manufacturing',
      semesters: [
        {
          id: 'mech-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: []
        },
        {
          id: 'mech-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: []
        },
        {
          id: 'mech-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: []
        },
        {
          id: 'mech-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: []
        },
        {
          id: 'mech-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: []
        },
        {
          id: 'mech-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: []
        },
        {
          id: 'mech-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: []
        }
      ]
    },
    {
      id: 'aiml',
      code: 'AIML',
      name: 'AI & ML',
      fullName: 'Artificial Intelligence and Machine Learning',
      icon: '🤖',
      color: '#EC4899',
      description: 'Explore AI, machine learning, and data science',
      semesters: [
        {
          id: 'aiml-sem1',
          semesterNumber: 1,
          name: 'Semester 1',
          subjects: []
        },
        {
          id: 'aiml-sem2',
          semesterNumber: 2,
          name: 'Semester 2',
          subjects: []
        },
        {
          id: 'aiml-sem3',
          semesterNumber: 3,
          name: 'Semester 3',
          subjects: []
        },
        {
          id: 'aiml-sem4',
          semesterNumber: 4,
          name: 'Semester 4',
          subjects: []
        },
        {
          id: 'aiml-sem5',
          semesterNumber: 5,
          name: 'Semester 5',
          subjects: []
        },
        {
          id: 'aiml-sem6',
          semesterNumber: 6,
          name: 'Semester 6',
          subjects: []
        },
        {
          id: 'aiml-sem7',
          semesterNumber: 7,
          name: 'Semester 7',
          subjects: []
        }
      ]
    }
  ]
};
