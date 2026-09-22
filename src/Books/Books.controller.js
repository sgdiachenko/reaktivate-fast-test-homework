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

  constructor(booksRepository) {
    this.booksRepository = booksRepository;
    makeAutoObservable(this, {
      booksRepository: false
    });
  }

  loadBooks = async () => {
    const books = await this.booksRepository.getBooks();

    runInAction(() => {
      this.books = books;
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
    const books = await this.booksRepository.getPrivateBooks();

    // The private response is used by both the list and the header counter.
    runInAction(() => {
      this.books = books;
      this.privateBooksCount = books.length;
    });
  };

  loadPrivateBooksCount = async () => {
    const books = await this.booksRepository.getPrivateBooks();

    runInAction(() => {
      this.privateBooksCount = books.length;
    });
  };

  get isAllBooksSelected() {
    return this.selectedMode === BOOKS_MODE.ALL;
  }

  get isPrivateBooksSelected() {
    return this.selectedMode === BOOKS_MODE.PRIVATE;
  }
}
