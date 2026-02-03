require("dotenv").config()

const express = require("express"),
      fs = require("fs"),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      dir = "public/",
      port = process.env.PORT || 3000

const app = express()

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to serve static files from public directory
app.use(express.static(dir))

// Route to serve the main HTML page; always render and let client show login/logout
app.get("/", (request, response) => {
  sendFile(response, "public/index.html")
})

app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })



// Function below will make sure server connects to mongo db before starting to listen


// // Start server after connecting to MongoDB
// async function start() {
//   try {
//     console.log(`Connecting to MongoDB at ${mongoUri}, db: ${mongoDbName}`)
//     const client = new MongoClient(mongoUri)
//     await client.connect()
//     const db = client.db(mongoDbName)
//     todosCollection = db.collection("todos") 
//     // Change/add name of collection as needed

//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port ${process.env.PORT}`)
//     })
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error)
//     process.exit(1)
//   }
// }

// start()