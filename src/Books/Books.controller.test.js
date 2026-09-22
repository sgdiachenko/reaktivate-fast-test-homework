import BooksController from "./Books.controller";

function deferred() {
  let resolve;
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("BooksController", () => {
  it("keeps Private books when an older All response arrives last", async () => {
    const older = deferred();
    const privateBooks = [{ name: "Private" }];
    const controller = new BooksController({
      getBooks: () => older.promise,
      getPrivateBooks: async () => privateBooks
    });

    const pending = controller.loadBooks();
    await controller.showPrivateBooks();
    older.resolve([{ name: "Public" }]);
    await pending;

    expect(controller.books).toEqual(privateBooks);
    expect(controller.isPrivateBooksSelected).toBe(true);
  });

  it("keeps All books when an older Private response arrives last", async () => {
    const older = deferred();
    const allBooks = [{ name: "Public" }, { name: "Private" }];
    const controller = new BooksController({
      getBooks: async () => allBooks,
      getPrivateBooks: () => older.promise
    });

    const pending = controller.showPrivateBooks();
    await controller.showAllBooks();
    older.resolve([{ name: "Private" }]);
    await pending;

    expect(controller.books).toEqual(allBooks);
    expect(controller.privateBooksCount).toBe(1);
    expect(controller.isAllBooksSelected).toBe(true);
  });

  it("keeps the newest All response even when the mode is unchanged", async () => {
    const older = deferred();
    const newestBooks = [{ name: "New" }];
    const controller = new BooksController({
      getBooks: jest.fn().mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce(newestBooks)
    });

    const pending = controller.loadBooks();
    await controller.loadBooks();
    older.resolve([{ name: "Old" }]);
    await pending;

    expect(controller.books).toEqual(newestBooks);
  });

  it("keeps the refreshed counter after creation when an initial count arrives last", async () => {
    const older = deferred();
    const controller = new BooksController({
      getBooks: async () => [],
      addBook: async () => true,
      getPrivateBooks: jest.fn().mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce([{ name: "New" }])
    });

    const pending = controller.initialize();
    await controller.addBook();
    older.resolve([]);
    await pending;

    expect(controller.privateBooksCount).toBe(1);
  });

  it("keeps a newer header count while accepting the current Private list", async () => {
    const older = deferred();
    const privateBooks = [{ name: "Private" }];
    const controller = new BooksController({
      getPrivateBooks: jest.fn().mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce([...privateBooks, { name: "New" }])
    });

    const pending = controller.showPrivateBooks();
    await controller.loadPrivateBooksCount();
    older.resolve(privateBooks);
    await pending;

    expect(controller.books).toEqual(privateBooks);
    expect(controller.privateBooksCount).toBe(2);
  });

  it("ignores an older count response after loading the Private list", async () => {
    const older = deferred();
    const privateBooks = [{ name: "Private" }];
    const controller = new BooksController({
      getPrivateBooks: jest.fn().mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce(privateBooks)
    });

    const pending = controller.loadPrivateBooksCount();
    await controller.showPrivateBooks();
    older.resolve([]);
    await pending;

    expect(controller.books).toEqual(privateBooks);
    expect(controller.privateBooksCount).toBe(1);
  });

  it("loads books from the repository", async () => {
    const books = [
      { id: 1, name: "Clean Code", author: "Robert C. Martin" }
    ];
    const booksRepository = {
      getBooks: jest.fn().mockResolvedValue(books)
    };
    const controller = new BooksController(booksRepository);

    await controller.loadBooks();

    expect(booksRepository.getBooks).toHaveBeenCalledTimes(1);
    expect(controller.books).toEqual(books);
  });

  it("initializes the books list and private books counter", async () => {
    const allBooks = [
      { id: 1, name: "Clean Code", author: "Robert C. Martin" },
      { name: "Public book", author: "Unknown" }
    ];
    const privateBooks = [allBooks[0]];
    const booksRepository = {
      getBooks: jest.fn().mockResolvedValue(allBooks),
      getPrivateBooks: jest.fn().mockResolvedValue(privateBooks)
    };
    const controller = new BooksController(booksRepository);

    await controller.initialize();

    expect(controller.books).toEqual(allBooks);
    expect(controller.privateBooksCount).toBe(1);
  });

  it("adds a book and reloads the books after a successful creation", async () => {
    const booksAfterCreation = [
      { id: 1, name: "Clean Code", author: "Robert C. Martin" },
      { id: 2, name: "Refactoring", author: "Martin Fowler" }
    ];
    const booksRepository = {
      addBook: jest.fn().mockResolvedValue(true),
      getBooks: jest.fn().mockResolvedValue(booksAfterCreation),
      getPrivateBooks: jest.fn().mockResolvedValue([booksAfterCreation[1]])
    };
    const controller = new BooksController(booksRepository);

    await controller.addBook();

    expect(booksRepository.addBook).toHaveBeenCalledWith({
      name: "Refactoring",
      author: "Martin Fowler"
    });
    expect(booksRepository.getBooks).toHaveBeenCalledTimes(1);
    expect(booksRepository.getPrivateBooks).toHaveBeenCalledTimes(1);
    expect(controller.books).toEqual(booksAfterCreation);
    expect(controller.privateBooksCount).toBe(1);
  });

  it("does not reload the books when creation fails", async () => {
    const booksRepository = {
      addBook: jest.fn().mockResolvedValue(false),
      getBooks: jest.fn()
    };
    const controller = new BooksController(booksRepository);

    await controller.addBook();

    expect(booksRepository.getBooks).not.toHaveBeenCalled();
  });

  it("reloads private books after creation in the private mode", async () => {
    const privateBooksAfterCreation = [
      {
        id: 2,
        name: "Refactoring",
        author: "Martin Fowler",
        ownerId: "sdiachenko"
      }
    ];
    const booksRepository = {
      addBook: jest.fn().mockResolvedValue(true),
      getBooks: jest.fn(),
      // First response switches to Private mode; the second refreshes it
      // after the book has been created.
      getPrivateBooks: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(privateBooksAfterCreation)
    };
    const controller = new BooksController(booksRepository);

    await controller.showPrivateBooks();
    await controller.addBook();

    expect(booksRepository.getPrivateBooks).toHaveBeenCalledTimes(2);
    expect(booksRepository.getBooks).not.toHaveBeenCalled();
    expect(controller.books).toEqual(privateBooksAfterCreation);
    expect(controller.isPrivateBooksSelected).toBe(true);
  });

  it("shows private books and marks the private mode as selected", async () => {
    const privateBooks = [
      {
        id: 1,
        name: "Refactoring",
        author: "Martin Fowler",
        ownerId: "sdiachenko"
      }
    ];
    const booksRepository = {
      getPrivateBooks: jest.fn().mockResolvedValue(privateBooks)
    };
    const controller = new BooksController(booksRepository);

    await controller.showPrivateBooks();

    expect(booksRepository.getPrivateBooks).toHaveBeenCalledTimes(1);
    expect(controller.books).toEqual(privateBooks);
    expect(controller.privateBooksCount).toBe(1);
    expect(controller.isPrivateBooksSelected).toBe(true);
    expect(controller.isAllBooksSelected).toBe(false);
  });

  it("returns to all books and marks the all mode as selected", async () => {
    const allBooks = [
      { id: 1, name: "Clean Code", author: "Robert C. Martin" }
    ];
    const booksRepository = {
      getBooks: jest.fn().mockResolvedValue(allBooks),
      getPrivateBooks: jest.fn().mockResolvedValue([])
    };
    const controller = new BooksController(booksRepository);

    await controller.showPrivateBooks();
    await controller.showAllBooks();

    expect(booksRepository.getBooks).toHaveBeenCalledTimes(1);
    expect(controller.books).toEqual(allBooks);
    expect(controller.isAllBooksSelected).toBe(true);
    expect(controller.isPrivateBooksSelected).toBe(false);
  });
});
