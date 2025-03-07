import { type Context, Hono } from "hono"
import { serveStatic } from "hono/bun"

const app = new Hono()

app.use("/*", serveStatic({ root: "./public" }))

app.get("/version", (c: Context) => {
  return c.html(
    <>
      <div>{Bun.version}</div>
      <img
        alt="Bun logo"
        src="https://upload.wikimedia.org/wikipedia/en/e/ec/Bun_JS_logo.png"
      />
    </>
  )
})

export default app
