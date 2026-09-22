import { makeAutoObservable, runInAction } from "mobx";

const BOOK_TO_ADD = {
  name: "Refactoring",
  author: "Martin Fowler"
};

export default class BooksController {
  books = [];

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

  addBook = async () => {
    const wasAdded = await this.booksRepository.addBook(BOOK_TO_ADD);

    if (wasAdded) {
      await this.loadBooks();
    }
  };
}
