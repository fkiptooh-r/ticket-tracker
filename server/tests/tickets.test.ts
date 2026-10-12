import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const app = createApp();

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
