import React from "react";

import BooksView from "../Books/Books.view";
import AppHeaderView from "./AppHeader.view";

const AppView = ({ booksController }) => (
  <div>
    <AppHeaderView controller={booksController} />
    <main className="app-content">
      <BooksView controller={booksController} />
    </main>
  </div>
);

export default AppView;
