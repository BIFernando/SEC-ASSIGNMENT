let allBooks = []; // store all books
let role = "";
const username = "admin"
const password = "1234"

async function loadBooks() {
    try {
        const response = await fetch('books.json');
        const books = await response.json();

        allBooks = books; // save globally
        displayBooks(allBooks);
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

function displayBooks(books) {

    let container;

    if (role === "admin") {
        container = document.getElementById("book-list-admin");
    } else {
        container = document.getElementById("book-list");
    }

    container.innerHTML = "";

    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        let buttons = "";

        // 🔐 ADMIN CONTROLS
        if (role === "admin") {
            buttons = `
                

                <button onclick="returnBook(${book.id})" ${book.availableCopies === book.totalCopies ? "disabled" : ""}>
                    Return
                </button>

                <button onclick="removeBook(${book.id})" class="delete">
                    Delete
                </button>
                <button onclick="openBorrow(${book.id})" ${book.availableCopies === 0 ? "disabled" : ""}>
    Borrow
</button>
            `;
        }

        // 👤 USER HAS NO ACTIONS
        if (role === "user") {
            buttons = "";
        }

        bookDiv.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>
                Available: ${book.availableCopies} / ${book.totalCopies}
            </p>

            ${buttons}
        `;

        container.appendChild(bookDiv);
    });
}



// Search Function
document.addEventListener("input", function (e) {

    if (e.target.id === "search" || e.target.id === "search-admin") {

        const searchText = e.target.value.toLowerCase();

        const filtered = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchText) ||
            book.author.toLowerCase().includes(searchText)
        );

        displayBooks(filtered);
    }
});

//burrow function
function borrowBook(id) {
    const book = allBooks.find(b => b.id === id);

    if (book && book.availableCopies > 0) {
        book.availableCopies--;
        displayBooks(allBooks);
    }
}

//returning function
function returnBook(id) {
    const book = allBooks.find(b => b.id === id);

    if (book && book.availableCopies < book.totalCopies) {
        book.availableCopies++;
        displayBooks(allBooks);
    }
}

//login logic
function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!user || !pass) {
        alert("Please fill all fields");
        return;
    }

    // 🔐 ADMIN LOGIN (fixed account)
    if (user === "admin" && pass === "1234") {
        role = "admin";

        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-section").style.display = "block";

        displayBooks(allBooks);
        return;
    }

    // 👤 USER LOGIN (from localStorage)
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(u => u.username === user && u.password === pass);

    if (foundUser) {
        role = "user";

        document.getElementById("login-section").style.display = "none";
        document.getElementById("user-section").style.display = "block";

        displayBooks(allBooks);
    } else {
        alert("Invalid login");
    }
}

//Add book function for the admin
function addBook() {
     if (role !== "admin") {
        alert("Unauthorized access");
        return;
    }
    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const copies = parseInt(document.getElementById("copies").value);

    if (!title || !author || !copies || copies <= 0) {
        alert("Please enter valid book details");
        return;
    }

    const newBook = {
        id: Date.now(),
        title,
        author,
        totalCopies: copies,
        availableCopies: copies
    };

    allBooks.push(newBook);
    displayBooks(allBooks);

    // clear inputs
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("copies").value = "";
}

//add remove function for the admin
function removeBook(id) {
     if (role !== "admin") {
        alert("Unauthorized access");
        return;
    }
    allBooks = allBooks.filter(book => book.id !== id);
    displayBooks(allBooks);
}

//show the burrow details for the admin
function showBorrowed() {
    const borrowed = allBooks.filter(book => book.availableCopies < book.totalCopies);
    displayBooks(borrowed);
}


//signup function 
function signup() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(u => u.username === username);

    if (exists) {
        alert("Username already exists");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! Now login.");

    //  CLEAR FIELDS AFTER SUCCESS
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
}

//go back button
function goBack() {
    // Hide both sections
    document.getElementById("user-section").style.display = "none";
    document.getElementById("admin-section").style.display = "none";

    // Show login again
    document.getElementById("login-section").style.display = "block";

    // Optional: reset role
    role = "";

    // Optional: clear inputs
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

let selectedBookId = null;

function openBorrow(id) {
    selectedBookId = id;

    const book = allBooks.find(b => b.id === id);

    document.getElementById("borrow-book-title").innerText =
        "Book: " + book.title;

    document.getElementById("borrow-modal").style.display = "flex";
}

function closeBorrow() {
    document.getElementById("borrow-modal").style.display = "none";

    document.getElementById("borrow-username").value = "";
    document.getElementById("borrow-userid").value = "";
}

function confirmBorrow() {
    const userName = document.getElementById("borrow-user-name").value.trim();
    const userId = document.getElementById("borrow-user-id").value.trim();

    if (!userName || !userId) {
        alert("Please enter user details");
        return;
    }

    const book = allBooks.find(b => b.id === selectedBookId);

    if (!book || book.availableCopies <= 0) {
        alert("Book not available");
        return;
    }

    // reduce available copies
    book.availableCopies--;

    // create borrow record
    let borrowRecords = JSON.parse(localStorage.getItem("borrowRecords")) || [];

    borrowRecords.push({
        bookId: book.id,
        title: book.title,
        userName: userName,
        
        borrowedAt: new Date().toLocaleString()
    });

    localStorage.setItem("borrowRecords", JSON.stringify(borrowRecords));

    closeBorrow();
    displayBooks(allBooks);

    alert(`${userName} borrowed "${book.title}"`);
}

function showBorrowedUI() {
    const records = JSON.parse(localStorage.getItem("borrowRecords")) || [];

    const container = document.getElementById("borrowed-list");

    container.innerHTML = "";

    if (records.length === 0) {
        container.innerHTML = "<p>No borrowed books yet</p>";
        return;
    }

    let table = `
        <table border="1" style="width:80%; margin:auto; border-collapse: collapse;">
            <tr>
                <th>Book</th>
                <th>User Name</th>
                
                <th>Date</th>
            </tr>
    `;

    records.forEach(r => {
        table += `
            <tr>
                <td>${r.title}</td>
                <td>${r.userName}</td>
                
                <td>${r.borrowedAt}</td>
            </tr>
        `;
    });

    table += "</table>";

    container.innerHTML = table;
}



// Load books on start
loadBooks();
