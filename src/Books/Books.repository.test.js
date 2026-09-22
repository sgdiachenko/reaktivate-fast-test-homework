import booksRepository from "./Books.repository";
import { API_BASE } from "../Shared/config";

describe("BooksRepository", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it.each([
    ["getBooks", "/"],
    ["getPrivateBooks", "/private"]
  ])("loads books through %s", async (method, path) => {
    const books = [{ name: "Book", author: "Author" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, json: async () => books
    });

    await expect(booksRepository[method]()).resolves.toEqual(books);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}${path}`);
  });

  it.each([
    [{ status: "ok" }, true],
    [{ status: "error" }, false],
    [null, false]
  ])("interprets creation response %p as %p", async (response, expected) => {
    const book = { name: "Book", author: "Author" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, json: async () => response
    });

    await expect(booksRepository.addBook(book)).resolves.toBe(expected);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book)
    });
  });
});
