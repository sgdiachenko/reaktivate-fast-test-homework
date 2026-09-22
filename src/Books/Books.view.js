import React from "react";
import { observer } from "mobx-react";

const BooksView = observer(({ controller }) => (
  <div>
    {controller.books.map((book, index) => (
      <div key={index}>
        {book.author}: {book.name}
      </div>
    ))}
    <button onClick={controller.addBook}>Add</button>
  </div>
));

export default BooksView;
