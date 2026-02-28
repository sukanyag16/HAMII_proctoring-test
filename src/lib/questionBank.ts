import { MCQQuestion } from "./types";

const allQuestions: MCQQuestion[] = [
  // Java (10 questions)
  { question: "Which keyword is used to inherit a class in Java?", options: ["implements", "inherits", "extends", "super"], answer: "extends", topic: "Java" },
  { question: "What is the default value of an int variable in Java?", options: ["null", "0", "undefined", "1"], answer: "0", topic: "Java" },
  { question: "Which collection class in Java does not allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "HashMap"], answer: "HashSet", topic: "Java" },
  { question: "What is the parent class of all classes in Java?", options: ["Main", "System", "Object", "Class"], answer: "Object", topic: "Java" },
  { question: "Which Java keyword is used to prevent a method from being overridden?", options: ["static", "final", "abstract", "private"], answer: "final", topic: "Java" },
  { question: "What does JVM stand for?", options: ["Java Very Much", "Java Virtual Machine", "Java Variable Method", "Java Visual Mode"], answer: "Java Virtual Machine", topic: "Java" },
  { question: "Which interface must a class implement to be used in a for-each loop?", options: ["Serializable", "Comparable", "Iterable", "Runnable"], answer: "Iterable", topic: "Java" },
  { question: "What is autoboxing in Java?", options: ["Creating objects manually", "Automatic conversion between primitive and wrapper types", "Boxing arrays", "Compressing data"], answer: "Automatic conversion between primitive and wrapper types", topic: "Java" },
  { question: "Which access modifier makes a member visible only within its own class?", options: ["public", "protected", "default", "private"], answer: "private", topic: "Java" },
  { question: "What exception is thrown when you access an array with an invalid index?", options: ["NullPointerException", "ArrayIndexOutOfBoundsException", "ClassCastException", "IOException"], answer: "ArrayIndexOutOfBoundsException", topic: "Java" },

  // Python (10 questions)
  { question: "What is the output of type([]) in Python?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], answer: "<class 'list'>", topic: "Python" },
  { question: "Which keyword is used to define a function in Python?", options: ["func", "function", "def", "lambda"], answer: "def", topic: "Python" },
  { question: "What does the 'self' parameter refer to in a Python class method?", options: ["The class itself", "The current instance of the class", "A global variable", "The parent class"], answer: "The current instance of the class", topic: "Python" },
  { question: "Which Python data structure is immutable?", options: ["List", "Dictionary", "Set", "Tuple"], answer: "Tuple", topic: "Python" },
  { question: "What does 'pip' stand for in Python?", options: ["Python Install Program", "Pip Installs Packages", "Python Integrated Platform", "Package Installation Process"], answer: "Pip Installs Packages", topic: "Python" },
  { question: "How do you create a virtual environment in Python 3?", options: ["python -m venv myenv", "pip install venv", "virtualenv create myenv", "python --venv myenv"], answer: "python -m venv myenv", topic: "Python" },
  { question: "What is a list comprehension in Python?", options: ["A way to sort lists", "A concise way to create lists using a single line", "A method to delete list items", "A loop that prints lists"], answer: "A concise way to create lists using a single line", topic: "Python" },
  { question: "Which built-in function returns the number of items in a Python object?", options: ["size()", "count()", "len()", "length()"], answer: "len()", topic: "Python" },
  { question: "What is a decorator in Python?", options: ["A comment style", "A function that modifies another function's behavior", "A class attribute", "A type of loop"], answer: "A function that modifies another function's behavior", topic: "Python" },
  { question: "What will 'hello'[::-1] return in Python?", options: ["hello", "olleh", "h", "Error"], answer: "olleh", topic: "Python" },

  // DBMS (10 questions)
  { question: "Which normal form removes transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: "3NF", topic: "DBMS" },
  { question: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Association, Consistency, Isolation, Durability", "Atomicity, Concurrency, Isolation, Durability", "Atomicity, Consistency, Integration, Durability"], answer: "Atomicity, Consistency, Isolation, Durability", topic: "DBMS" },
  { question: "Which SQL keyword is used to remove duplicate rows from results?", options: ["UNIQUE", "DISTINCT", "DIFFERENT", "REMOVE"], answer: "DISTINCT", topic: "DBMS" },
  { question: "A foreign key in a table refers to the _____ of another table.", options: ["Foreign key", "Primary key", "Candidate key", "Super key"], answer: "Primary key", topic: "DBMS" },
  { question: "Which type of join returns all records from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: "FULL OUTER JOIN", topic: "DBMS" },
  { question: "What is a deadlock in DBMS?", options: ["A fast query", "Two transactions waiting for each other indefinitely", "A corrupted table", "A backup failure"], answer: "Two transactions waiting for each other indefinitely", topic: "DBMS" },
  { question: "Which command is used to permanently save a transaction?", options: ["SAVEPOINT", "ROLLBACK", "COMMIT", "DELETE"], answer: "COMMIT", topic: "DBMS" },
  { question: "What does a clustered index determine?", options: ["Query speed", "Physical order of data on disk", "Logical order of data", "Number of columns"], answer: "Physical order of data on disk", topic: "DBMS" },
  { question: "Which isolation level prevents dirty reads but allows non-repeatable reads?", options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], answer: "READ COMMITTED", topic: "DBMS" },
  { question: "What is a view in SQL?", options: ["A physical table", "A virtual table based on a query", "An index", "A stored procedure"], answer: "A virtual table based on a query", topic: "DBMS" },

  // Operating Systems (10 questions)
  { question: "Which scheduling algorithm may cause starvation?", options: ["Round Robin", "FCFS", "Shortest Job First", "Multilevel Queue"], answer: "Shortest Job First", topic: "OS" },
  { question: "What is thrashing in operating systems?", options: ["CPU overheating", "Excessive paging causing performance drop", "Disk fragmentation", "Memory leak"], answer: "Excessive paging causing performance drop", topic: "OS" },
  { question: "Which page replacement algorithm is optimal but impractical?", options: ["FIFO", "LRU", "Belady's Optimal Algorithm", "Clock"], answer: "Belady's Optimal Algorithm", topic: "OS" },
  { question: "What is a semaphore used for?", options: ["Memory allocation", "Process synchronization", "Disk scheduling", "File management"], answer: "Process synchronization", topic: "OS" },
  { question: "Which memory allocation strategy suffers from external fragmentation?", options: ["Paging", "Segmentation", "Both", "Neither"], answer: "Segmentation", topic: "OS" },
  { question: "What are the necessary conditions for a deadlock?", options: ["Mutual exclusion only", "Hold & wait only", "Mutual exclusion, Hold & wait, No preemption, Circular wait", "Starvation and livelock"], answer: "Mutual exclusion, Hold & wait, No preemption, Circular wait", topic: "OS" },
  { question: "What is the role of the dispatcher in OS?", options: ["Schedule processes", "Give control of CPU to the selected process", "Manage memory", "Handle I/O"], answer: "Give control of CPU to the selected process", topic: "OS" },
  { question: "Which system call is used to create a new process in Unix?", options: ["exec()", "fork()", "wait()", "exit()"], answer: "fork()", topic: "OS" },
  { question: "What is virtual memory?", options: ["Extra RAM", "Using disk space as extended memory", "Cache memory", "Register memory"], answer: "Using disk space as extended memory", topic: "OS" },
  { question: "In round-robin scheduling, what determines the time each process gets?", options: ["Priority", "Burst time", "Time quantum", "Arrival time"], answer: "Time quantum", topic: "OS" },

  // DSA (10 questions)
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: "O(log n)", topic: "DSA" },
  { question: "Which data structure uses LIFO ordering?", options: ["Queue", "Stack", "Array", "Linked List"], answer: "Stack", topic: "DSA" },
  { question: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: "O(n²)", topic: "DSA" },
  { question: "Which traversal of a BST gives sorted output?", options: ["Preorder", "Postorder", "Inorder", "Level order"], answer: "Inorder", topic: "DSA" },
  { question: "Which data structure is used for BFS traversal?", options: ["Stack", "Queue", "Heap", "Array"], answer: "Queue", topic: "DSA" },
  { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: "O(n)", topic: "DSA" },
  { question: "Which data structure is best for implementing a priority queue?", options: ["Array", "Linked List", "Binary Heap", "Stack"], answer: "Binary Heap", topic: "DSA" },
  { question: "What is the time complexity of inserting at the beginning of a singly linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(1)", topic: "DSA" },
  { question: "Which algorithm is used to find the shortest path in a weighted graph?", options: ["BFS", "DFS", "Dijkstra's Algorithm", "Kruskal's Algorithm"], answer: "Dijkstra's Algorithm", topic: "DSA" },
  { question: "What is the best-case time complexity of bubble sort?", options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], answer: "O(n)", topic: "DSA" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateQuestions(count: number = 20): MCQQuestion[] {
  const topics = ["Java", "Python", "DBMS", "OS", "DSA"];
  const perTopic = Math.floor(count / topics.length); // 4 per topic
  const selected: MCQQuestion[] = [];

  for (const topic of topics) {
    const topicQs = shuffleArray(allQuestions.filter((q) => q.topic === topic));
    selected.push(...topicQs.slice(0, perTopic));
  }

  return shuffleArray(selected);
}
