let allBooks = []; // store all books

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
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    if (books.length === 0) {
        bookList.innerHTML = "<p>No books found</p>";
        return;
    }

    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        bookDiv.innerHTML = `
    <h3>${book.title}</h3>
    <p>Author: ${book.author}</p>
    <p>Available: ${book.availableCopies} / ${book.totalCopies}</p>

    <button onclick="borrowBook(${book.id})" ${book.availableCopies === 0 ? "disabled" : ""}>
        Borrow
    </button>

    <button onclick="returnBook(${book.id})" ${book.availableCopies === book.totalCopies ? "disabled" : ""}>
        Return
    </button>
`;

        bookList.appendChild(bookDiv);
    });
}

// Search Function
document.getElementById("search").addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchText) ||
        book.author.toLowerCase().includes(searchText)
    );

    displayBooks(filteredBooks);
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

// Load books on start
loadBooks();