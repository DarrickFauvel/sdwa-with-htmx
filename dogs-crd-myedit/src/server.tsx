import { type Context, Hono } from "hono"
import { serveStatic } from "hono/bun"

type Game = { id: string; name: string; image: string }
const games = new Map<string, Game>()

const FILEPATH = "./src/games.json"

async function addGame(name: string, image: string) {
  const id = crypto.randomUUID()
  const game = { id, name, image }
  games.set(id, game)
  saveFormEntry(game)
  return game
}

function gameRow(game: Game) {
  return (
    <tr className="on-hover">
      <td>{game.name}</td>
      <td>
        <img src={game.image} alt={game.name} style={{ width: "100px" }} />
      </td>
      <td className="buttons">
        <button
          class="show-on-hover"
          hx-delete={"/game/${game.id}"}
          hx-confirm="Are you sure?"
          hx-target="closest tr"
          hx-swap="delete"
        >
          X
        </button>
      </td>
    </tr>
  )
}

async function saveFormEntry(newEntry: object) {
  try {
    let existingData: Game[] = []

    try {
      const file = Bun.file(FILEPATH)
      const fileContents = await file.text()
      existingData = JSON.parse(fileContents)
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }

    existingData.push(newEntry)
    await Bun.write(FILEPATH, JSON.stringify(existingData, null, 2))

    console.log("Form entry saved")
  } catch (error) {
    console.error("Eror saving form entry:", error)
  }
}

async function getSavedData() {
  try {
    let existingData: object[] = []

    try {
      const file = Bun.file(FILEPATH)
      const fileContents = await file.text()
      existingData = JSON.parse(fileContents)
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }

    console.log("Saved data retrieved")

    return existingData
  } catch (error) {
    console.error("Eror saving loading entries:", error)
  }
}



const app = new Hono()

app.use("/*", serveStatic({ root: "./public" }))

app.get("/table-rows", async (c: Context) => {
  const savedData = await getSavedData()
  return c.html(savedData.map(item => gameRow(item)))
})

app.post("/game", async (c: Context) => {
  const formData = await c.req.formData()
  const name = (formData.get("name") as string) || ""
  const image = (formData.get("image") as string) || ""
  const game = await addGame(name, image)
  return c.html(await gameRow(game), 201)
})

app.delete("/game/:id", (c: Context) => {
  const id = c.req.param("id")
  games.delete(id)
  return c.body(null)
})

export default app
