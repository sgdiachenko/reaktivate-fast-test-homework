import React from "react";
import { observer } from "mobx-react";

const AppHeaderView = observer(({ controller }) => (
  <header className="app-header">
    Your books: {controller.privateBooksCount}
  </header>
));

export default AppHeaderView;
