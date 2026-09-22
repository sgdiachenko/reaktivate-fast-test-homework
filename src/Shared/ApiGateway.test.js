import ApiGateway from "./ApiGateway";

describe("ApiGateway", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it.each(["get", "post"])("rejects HTTP errors from %s before parsing JSON", async method => {
    const json = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json });

    await expect(new ApiGateway()[method]("/", {})).rejects.toThrow("HTTP 500");

    expect(json).not.toHaveBeenCalled();
  });

  it.each(["get", "post"])("returns successful JSON from %s", async method => {
    const data = { status: "ok" };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => data });
    await expect(new ApiGateway()[method]("/", {})).resolves.toEqual(data);
  });

  it("propagates network failures", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failed"));
    await expect(new ApiGateway().get("/")).rejects.toThrow("Network failed");
  });
});
