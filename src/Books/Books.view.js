import React from "react";
import { observer } from "mobx-react";

const BooksView = observer(({ controller }) => (
  <div>
    <div>
      <button
        type="button"
        onClick={controller.showAllBooks}
        disabled={controller.isAllBooksSelected}
      >
        All books
      </button>
      <button
        type="button"
        onClick={controller.showPrivateBooks}
        disabled={controller.isPrivateBooksSelected}
      >
        Private books
      </button>
    </div>
    {controller.books.map((book, index) => (
      <div key={index}>
        {book.author}: {book.name}
      </div>
    ))}
    <button onClick={controller.addBook}>Add</button>
  </div>
));

export default BooksView;
