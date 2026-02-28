import { MCQQuestion } from "./types";

const allQuestions: MCQQuestion[] = [
  // Data Structures
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: "O(log n)", topic: "Data Structures" },
  { question: "Which data structure uses LIFO ordering?", options: ["Queue", "Stack", "Array", "Linked List"], answer: "Stack", topic: "Data Structures" },
  { question: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: "O(n²)", topic: "Data Structures" },
  { question: "Which traversal of a BST gives sorted output?", options: ["Preorder", "Postorder", "Inorder", "Level order"], answer: "Inorder", topic: "Data Structures" },
  { question: "What is the maximum number of children a node can have in a binary tree?", options: ["1", "2", "3", "Unlimited"], answer: "2", topic: "Data Structures" },
  { question: "Which data structure is used for BFS traversal?", options: ["Stack", "Queue", "Heap", "Array"], answer: "Queue", topic: "Data Structures" },
  { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: "O(n)", topic: "Data Structures" },
  { question: "A full binary tree with n leaves has how many total nodes?", options: ["n", "2n", "2n - 1", "2n + 1"], answer: "2n - 1", topic: "Data Structures" },
  { question: "Which data structure is best for implementing a priority queue?", options: ["Array", "Linked List", "Heap", "Stack"], answer: "Heap", topic: "Data Structures" },
  { question: "What is the time complexity of inserting at the beginning of a singly linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(1)", topic: "Data Structures" },

  // DBMS
  { question: "Which normal form removes transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: "3NF", topic: "DBMS" },
  { question: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Association, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Atomicity, Consistency, Integration, Durability"], answer: "Atomicity, Consistency, Isolation, Durability", topic: "DBMS" },
  { question: "Which SQL keyword is used to remove duplicate rows from results?", options: ["UNIQUE", "DISTINCT", "DIFFERENT", "REMOVE"], answer: "DISTINCT", topic: "DBMS" },
  { question: "A foreign key in a table refers to the _____ of another table.", options: ["Foreign key", "Primary key", "Candidate key", "Super key"], answer: "Primary key", topic: "DBMS" },
  { question: "Which type of join returns all records from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: "FULL OUTER JOIN", topic: "DBMS" },
  { question: "What is a deadlock in DBMS?", options: ["A fast query", "Two transactions waiting for each other indefinitely", "A corrupted table", "A backup failure"], answer: "Two transactions waiting for each other indefinitely", topic: "DBMS" },
  { question: "Which command is used to permanently save a transaction?", options: ["SAVEPOINT", "ROLLBACK", "COMMIT", "DELETE"], answer: "COMMIT", topic: "DBMS" },
  { question: "What does a clustered index determine?", options: ["Query speed", "Physical order of data", "Logical order of data", "Number of columns"], answer: "Physical order of data", topic: "DBMS" },
  { question: "Which isolation level prevents dirty reads but allows non-repeatable reads?", options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], answer: "READ COMMITTED", topic: "DBMS" },
  { question: "What is a view in SQL?", options: ["A physical table", "A virtual table based on a query", "An index", "A stored procedure"], answer: "A virtual table based on a query", topic: "DBMS" },

  // Operating Systems
  { question: "Which scheduling algorithm may cause starvation?", options: ["Round Robin", "FCFS", "Shortest Job First", "Multilevel Queue"], answer: "Shortest Job First", topic: "Operating Systems" },
  { question: "What is thrashing in operating systems?", options: ["CPU overheating", "Excessive paging causing performance drop", "Disk fragmentation", "Memory leak"], answer: "Excessive paging causing performance drop", topic: "Operating Systems" },
  { question: "Which page replacement algorithm is optimal but impractical?", options: ["FIFO", "LRU", "Optimal (Belady's)", "Clock"], answer: "Optimal (Belady's)", topic: "Operating Systems" },
  { question: "What is a semaphore used for?", options: ["Memory allocation", "Process synchronization", "Disk scheduling", "File management"], answer: "Process synchronization", topic: "Operating Systems" },
  { question: "Which memory allocation strategy suffers from external fragmentation?", options: ["Paging", "Segmentation", "Both", "Neither"], answer: "Segmentation", topic: "Operating Systems" },
  { question: "What are the necessary conditions for a deadlock?", options: ["Mutual exclusion only", "Hold & wait only", "Mutual exclusion, Hold & wait, No preemption, Circular wait", "Starvation and livelock"], answer: "Mutual exclusion, Hold & wait, No preemption, Circular wait", topic: "Operating Systems" },
  { question: "What is the role of the dispatcher in OS?", options: ["Schedule processes", "Give control of CPU to the selected process", "Manage memory", "Handle I/O"], answer: "Give control of CPU to the selected process", topic: "Operating Systems" },
  { question: "Which system call is used to create a new process in Unix?", options: ["exec()", "fork()", "wait()", "exit()"], answer: "fork()", topic: "Operating Systems" },
  { question: "What is virtual memory?", options: ["Extra RAM", "Using disk space as extended memory", "Cache memory", "Register memory"], answer: "Using disk space as extended memory", topic: "Operating Systems" },
  { question: "In round-robin scheduling, what determines the time each process gets?", options: ["Priority", "Burst time", "Time quantum", "Arrival time"], answer: "Time quantum", topic: "Operating Systems" },

  // Networking
  { question: "Which layer of the OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], answer: "Network", topic: "Networking" },
  { question: "What protocol is used to resolve IP addresses to MAC addresses?", options: ["DNS", "DHCP", "ARP", "ICMP"], answer: "ARP", topic: "Networking" },
  { question: "Which transport layer protocol is connectionless?", options: ["TCP", "UDP", "HTTP", "FTP"], answer: "UDP", topic: "Networking" },
  { question: "What is the default port number for HTTPS?", options: ["80", "443", "8080", "21"], answer: "443", topic: "Networking" },
  { question: "What does DNS stand for?", options: ["Data Network System", "Domain Name System", "Dynamic Network Service", "Digital Name Server"], answer: "Domain Name System", topic: "Networking" },
  { question: "Which protocol is used for sending emails?", options: ["POP3", "IMAP", "SMTP", "HTTP"], answer: "SMTP", topic: "Networking" },
  { question: "What is the purpose of a subnet mask?", options: ["Encrypt data", "Divide IP address into network and host parts", "Assign IP addresses", "Route packets"], answer: "Divide IP address into network and host parts", topic: "Networking" },
  { question: "Which device operates at Layer 2 of the OSI model?", options: ["Router", "Hub", "Switch", "Gateway"], answer: "Switch", topic: "Networking" },
  { question: "What is the maximum payload of an Ethernet frame?", options: ["1000 bytes", "1500 bytes", "2000 bytes", "512 bytes"], answer: "1500 bytes", topic: "Networking" },
  { question: "What does TCP use to ensure reliable delivery?", options: ["Checksums only", "Acknowledgments and retransmission", "Encryption", "Compression"], answer: "Acknowledgments and retransmission", topic: "Networking" },

  // Programming
  { question: "What is polymorphism in OOP?", options: ["Multiple inheritance", "Ability to take many forms", "Data hiding", "Code reuse"], answer: "Ability to take many forms", topic: "Programming" },
  { question: "Which keyword is used to inherit a class in Java?", options: ["implements", "inherits", "extends", "super"], answer: "extends", topic: "Programming" },
  { question: "What is the base case in recursion?", options: ["The recursive call", "The condition that stops recursion", "The return type", "The function signature"], answer: "The condition that stops recursion", topic: "Programming" },
  { question: "What design pattern ensures a class has only one instance?", options: ["Factory", "Observer", "Singleton", "Strategy"], answer: "Singleton", topic: "Programming" },
  { question: "What is encapsulation?", options: ["Inheriting properties", "Bundling data and methods together", "Method overriding", "Multiple dispatch"], answer: "Bundling data and methods together", topic: "Programming" },
  { question: "What is the output of 5 % 2 in most programming languages?", options: ["0", "1", "2", "2.5"], answer: "1", topic: "Programming" },
  { question: "Which principle states that a class should have only one reason to change?", options: ["Open/Closed", "Single Responsibility", "Liskov Substitution", "Dependency Inversion"], answer: "Single Responsibility", topic: "Programming" },
  { question: "What is a pure function?", options: ["A function with no parameters", "A function with no side effects that returns the same output for the same input", "A recursive function", "An async function"], answer: "A function with no side effects that returns the same output for the same input", topic: "Programming" },
  { question: "What is the difference between == and === in JavaScript?", options: ["No difference", "== checks type, === doesn't", "=== checks type and value, == only value", "=== is assignment"], answer: "=== checks type and value, == only value", topic: "Programming" },
  { question: "What is garbage collection?", options: ["Deleting files", "Automatic memory management to reclaim unused memory", "Clearing the cache", "Disk cleanup"], answer: "Automatic memory management to reclaim unused memory", topic: "Programming" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateQuestions(count: number = 15): MCQQuestion[] {
  // Pick 3 from each topic to ensure coverage
  const topics = ["Data Structures", "DBMS", "Operating Systems", "Networking", "Programming"];
  const selected: MCQQuestion[] = [];

  for (const topic of topics) {
    const topicQs = shuffleArray(allQuestions.filter((q) => q.topic === topic));
    selected.push(...topicQs.slice(0, 3));
  }

  return shuffleArray(selected);
}
