import BooksController from "./Books.controller";

describe("BooksController", () => {
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

  it("adds a book and reloads the books after a successful creation", async () => {
    const booksAfterCreation = [
      { id: 1, name: "Clean Code", author: "Robert C. Martin" },
      { id: 2, name: "Refactoring", author: "Martin Fowler" }
    ];
    const booksRepository = {
      addBook: jest.fn().mockResolvedValue(true),
      getBooks: jest.fn().mockResolvedValue(booksAfterCreation)
    };
    const controller = new BooksController(booksRepository);

    await controller.addBook();

    expect(booksRepository.addBook).toHaveBeenCalledWith({
      name: "Refactoring",
      author: "Martin Fowler"
    });
    expect(booksRepository.getBooks).toHaveBeenCalledTimes(1);
    expect(controller.books).toEqual(booksAfterCreation);
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
});
