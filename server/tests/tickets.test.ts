import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import type { TicketStatus } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();

// Inserts tickets one minute apart, oldest first, so ordering is deterministic.
async function seedTickets(statuses: TicketStatus[]) {
  const start = Date.UTC(2026, 0, 1);
  await prisma.ticket.createMany({
    data: statuses.map((status, i) => ({
      title: `Ticket ${i + 1}`,
      status,
      createdAt: new Date(start + i * 60_000),
    })),
  });
}

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE tickets RESTART IDENTITY`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /tickets", () => {
  it("creates a ticket with default status and priority", async () => {
    const res = await request(app).post("/tickets").send({ title: "Printer is on fire" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      title: "Printer is on fire",
      description: null,
      status: "open",
      priority: "medium",
      createdAt: expect.any(String),
    });
    expect(await prisma.ticket.count()).toBe(1);
  });

  it("trims input and stores the given description and priority", async () => {
    const res = await request(app)
      .post("/tickets")
      .send({ title: "  VPN down  ", description: "  Since 9am  ", priority: "high" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "VPN down", description: "Since 9am", priority: "high" });
  });

  it("rejects a blank title without creating anything", async () => {
    const res = await request(app).post("/tickets").send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([expect.objectContaining({ field: "title" })]);
    expect(await prisma.ticket.count()).toBe(0);
  });

  it("rejects an unknown priority and unexpected fields", async () => {
    const badPriority = await request(app).post("/tickets").send({ title: "x", priority: "urgent" });
    const extraField = await request(app).post("/tickets").send({ title: "x", status: "closed" });

    expect(badPriority.status).toBe(400);
    expect(extraField.status).toBe(400);
    expect(await prisma.ticket.count()).toBe(0);
  });
});

describe("GET /tickets", () => {
  it("returns newest tickets first with default pagination", async () => {
    await seedTickets(["open", "open", "closed"]);

    const res = await request(app).get("/tickets");

    expect(res.status).toBe(200);
    expect(res.body.data.map((t: { title: string }) => t.title)).toEqual([
      "Ticket 3",
      "Ticket 2",
      "Ticket 1",
    ]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 3, totalPages: 1 });
  });

  it("paginates with page and limit", async () => {
    await seedTickets(["open", "open", "open", "open", "open"]);

    const page1 = await request(app).get("/tickets?page=1&limit=2");
    const page3 = await request(app).get("/tickets?page=3&limit=2");

    expect(page1.body.data.map((t: { title: string }) => t.title)).toEqual(["Ticket 5", "Ticket 4"]);
    expect(page1.body.meta).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
    expect(page3.body.data.map((t: { title: string }) => t.title)).toEqual(["Ticket 1"]);
  });

  it("filters by status, with totals reflecting the filter", async () => {
    await seedTickets(["open", "in_progress", "closed", "closed"]);

    const res = await request(app).get("/tickets?status=closed");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((t: { status: string }) => t.status === "closed")).toBe(true);
    expect(res.body.meta.total).toBe(2);
  });

  it.each(["status=urgent", "page=0", "page=abc", "limit=101"])(
    "rejects invalid query %s",
    async (query) => {
      const res = await request(app).get(`/tickets?${query}`);

      expect(res.status).toBe(400);
    },
  );
});
