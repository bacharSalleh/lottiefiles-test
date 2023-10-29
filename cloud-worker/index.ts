import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@libsql/client";
import z from "zod";

const app = new Hono();

app.use('/*', cors())

app.get("/api", async (c) => {
  if (!c.env?.LIBSQL_DB_URL || !c.env.LIBSQL_DB_AUTH_TOKEN) {
    return c.text("ENV not good");
  }

  const db = createClient({
    url: String(c.env.LIBSQL_DB_URL),
    authToken: String(c.env.LIBSQL_DB_AUTH_TOKEN),
  });

  try {
    const data = await db.execute("select * from AnimationEdge");
    return c.json(data.rows);
  } catch (error) {
    c.text("Err, please try again later");
  }
});

app.post("/api", async (c) => {
  if (!c.env?.LIBSQL_DB_URL || !c.env.LIBSQL_DB_AUTH_TOKEN) {
    return c.text("ENV not good");
  }

  try {
    const data = await c.req.json();

    const AnimationEdgeSchema = z.object({
      cursor: z.string(),
      lottieUrl: z.string(),
      jsonUrl: z.string(),
      createdByFirstName: z.string(),
    });

    AnimationEdgeSchema.parse(data); // This will throw if validation fails

    const db = createClient({
      url: String(c.env.LIBSQL_DB_URL),
      authToken: String(c.env.LIBSQL_DB_AUTH_TOKEN),
    });

    await db.execute({
      sql: `
      INSERT INTO AnimationEdge (cursor, lottieUrl, jsonUrl, createdByFirstName)
      VALUES (:cursor, :lottieUrl, :jsonUrl, :createdByFirstName)
      ON CONFLICT (cursor)
      DO UPDATE SET lottieUrl = :lottieUrl, jsonUrl = :jsonUrl, createdByFirstName = :createdByFirstName;
    `,
      args: {
        cursor: data.cursor,
        lottieUrl: data.lottieUrl,
        jsonUrl: data.jsonUrl,
        createdByFirstName: data.createdByFirstName,
      },
    });

    return c.text("success", 200);
  } catch (e) {
    console.log(e);

    return c.text("Validation or DB insertion failed", 400);
  }
});

app.delete("/api/:cursor", async (c) => {
  if (!c.env?.LIBSQL_DB_URL || !c.env.LIBSQL_DB_AUTH_TOKEN) {
    return c.text("ENV not good");
  }

  const cursorSchema = z.string().min(1);
  cursorSchema.parse(c.req.param("cursor"));

  const db = createClient({
    url: String(c.env.LIBSQL_DB_URL),
    authToken: String(c.env.LIBSQL_DB_AUTH_TOKEN),
  });

  try {
    await db.execute({
      sql: "DELETE FROM AnimationEdge where cursor = ?",
      args: [c.req.param("cursor")],
    });
    return c.text("success", 200);
  } catch (error) {
    c.text("Err, please try again later");
  }
});

export default app;
