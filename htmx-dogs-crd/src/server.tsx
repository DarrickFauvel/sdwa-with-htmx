import { type Context, Hono } from "hono"
import { serveStatic } from "hono/bun"

type Dog = { id: string; name: string; breed: string }
const dogs = new Map<string, Dog>()

function addDog(name: string, breed: string) {
  const id = crypto.randomUUID()
  const dog = { id, name, breed }
  dogs.set(id, dog)
  return dog
}

addDog("Comet", "Whippet")
addDog("Oscar", "German ShortHaired Pointer")

function dogRow(dog: Dog) {
  return (
    <tr className="on-hover">
      <td>{dog.name}</td>
      <td>{dog.breed}</td>
      <td className="buttons">
        <button
          class="show-on-hover"
          hx-delete={"/dog/${dog.id}"}
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

const app = new Hono()

app.use("/*", serveStatic({ root: "./public" }))

app.get("/table-rows", (c: Context) => {
  const sortedDogs = Array.from(dogs.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  return c.html(<>{sortedDogs.map(dogRow)}</>)
})

app.post("/dog", async (c: Context) => {
  const formData = await c.req.formData()
  const name = (formData.get("name") as string) || ""
  const breed = (formData.get("breed") as string) || ""
  const dog = addDog(name, breed)
  return c.html(dogRow(dog), 201)
})

app.delete("/dog/:id", (c: Context) => {
  const id = c.req.param("id")
  dogs.delete(id)
  return c.body(null)
})

export default app
