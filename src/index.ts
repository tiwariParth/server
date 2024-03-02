import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.get("/api/v1/blog", (c) => {
  return c.text("Hello Hono!");
});

app.use("/api/v1/blog/*", async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const token = header.split(" ")[1];
  const response = await verify(token, c.env?.JWT_SECRET);

  if (response.id) {
    next();
  } else {
    c.status(403);
    return c.json({ message: "Unauthorized" });
  }
});

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    const jwt = sign({ id: user.id }, c.env?.JWT_SECRET);

    return c.text("jwt here");
  } catch (e) {
    return c.status(403);
  }
});

app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      return c.status(403);
    }
    return c.json({ message: "Signup" });
  } catch (e) {
    return c.status(403);
  }
});

app.post("/api/v1/blog", (c) => {
  return c.json({ message: "Signup" });
});

app.put("/api/v1/blog", (c) => {
  return c.json({ message: "Signup" });
});

app.get("/api/v1/blog/:id", (c) => {
  return c.text("Hello Hono!");
});

export default app;
