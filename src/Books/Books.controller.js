import { makeAutoObservable, runInAction } from "mobx";

// Part 1 explicitly allows mocked hardcoded data for book creation.
const BOOK_TO_ADD = {
  name: "Refactoring",
  author: "Martin Fowler"
};

const BOOKS_MODE = {
  ALL: "all",
  PRIVATE: "private"
};

export default class BooksController {
  books = [];
  privateBooksCount = 0;
  selectedMode = BOOKS_MODE.ALL;
  // See README.md: Design decisions > Stale response protection.
  listRequestId = 0;
  countRequestId = 0;

  constructor(booksRepository) {
    this.booksRepository = booksRepository;
    makeAutoObservable(this, {
      booksRepository: false,
      listRequestId: false,
      countRequestId: false
    });
  }

  loadBooks = async () => {
    const requestId = ++this.listRequestId;
    const books = await this.booksRepository.getBooks();

    runInAction(() => {
      if (requestId === this.listRequestId) {
        this.books = books;
      }
    });
  };

  initialize = async () => {
    // All books populate the initial list, while private books provide
    // the application-wide header count.
    await Promise.all([this.loadBooks(), this.loadPrivateBooksCount()]);
  };

  addBook = async () => {
    const wasAdded = await this.booksRepository.addBook(BOOK_TO_ADD);

    if (wasAdded) {
      await this.reloadSelectedBooks();

      // Loading private books already updates both the visible list and the
      // counter. In All mode, the private counter requires a separate request.
      if (this.isAllBooksSelected) {
        await this.loadPrivateBooksCount();
      }
    }
  };

  reloadSelectedBooks = async () => {
    if (this.isPrivateBooksSelected) {
      await this.loadPrivateBooks();
      return;
    }

    await this.loadBooks();
  };

  showAllBooks = async () => {
    this.selectedMode = BOOKS_MODE.ALL;
    await this.loadBooks();
  };

  showPrivateBooks = async () => {
    this.selectedMode = BOOKS_MODE.PRIVATE;
    await this.loadPrivateBooks();
  };

  loadPrivateBooks = async () => {
    const listRequestId = ++this.listRequestId;
    const countRequestId = ++this.countRequestId;
    const books = await this.booksRepository.getPrivateBooks();

    // The private response is used by both the list and the header counter.
    runInAction(() => {
      if (listRequestId === this.listRequestId) {
        this.books = books;
      }
      if (countRequestId === this.countRequestId) {
        this.privateBooksCount = books.length;
      }
    });
  };

  loadPrivateBooksCount = async () => {
    const requestId = ++this.countRequestId;
    const books = await this.booksRepository.getPrivateBooks();

    runInAction(() => {
      if (requestId === this.countRequestId) {
        this.privateBooksCount = books.length;
      }
    });
  };

  get isAllBooksSelected() {
    return this.selectedMode === BOOKS_MODE.ALL;
  }

  get isPrivateBooksSelected() {
    return this.selectedMode === BOOKS_MODE.PRIVATE;
  }
}
