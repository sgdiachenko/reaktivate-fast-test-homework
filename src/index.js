import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import booksRepository from "./Books/Books.repository";
import BooksController from "./Books/Books.controller";
import BooksView from "./Books/Books.view";

const booksController = new BooksController(booksRepository);

booksController.loadBooks();

const rootElement = document.getElementById("root");
ReactDOM.render(<BooksView controller={booksController} />, rootElement);
