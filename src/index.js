import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import AppView from "./App/App.view";
import booksRepository from "./Books/Books.repository";
import BooksController from "./Books/Books.controller";

const booksController = new BooksController(booksRepository);

booksController.initialize();

const rootElement = document.getElementById("root");
ReactDOM.render(<AppView booksController={booksController} />, rootElement);
