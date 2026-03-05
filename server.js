require("dotenv").config()

const express = require("express"),
      fs = require("fs"),
      mime = require("mime"),
      dir = "public/",
      port = process.env.PORT || 3000

const app = express()
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const { MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let infoCollection;

// Function below will make sure server connects to mongo db before starting to listen
async function initDB() {
  try {
    await client.connect()
    const db = client.db('game')
    infoCollection = db.collection('info')
    console.log("Successfully connected.")
  } catch (err) {
    console.log("DB connection error: ", err)
  }
}

initDB()

// Helper function to send files (for non-static files)
const sendFile = function(response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function(error, content) {
    // if the error = null, then we've loaded the file successfully
    if (error === null) {
      // status code: https://httpstatuses.com
      response.setHeader("Content-Type", type)
      response.send(content)
    } else {
      // file not found, error code 404
      response.status(404).send("404 Error: File Not Found")
    }
  })
}

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to serve static files from public directory
app.use(express.static(dir))

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Route to serve the main HTML page; always render and let client show login/logout
app.get("/", (request, response) => {
  sendFile(response, "public/index.html")
})

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get("/api/auth-status", (request, response) => {
  const isAuthenticated = !!(request.oidc && request.oidc.isAuthenticated())
  if (!isAuthenticated) {
    return response.json({ authenticated: false })
  }
  response.json({
    authenticated: true,
    user: {
      sub: request.oidc.user?.sub,
      name: request.oidc.user?.name,
      email: request.oidc.user?.email
    }
  })
})

// Return which levels the current user has completed
app.get("/api/completed-levels", async (request, response) => {
  const isAuthenticated = !!(request.oidc && request.oidc.isAuthenticated())

  if (!isAuthenticated) {
    return response.json({ authenticated: false, completedLevels: [] })
  }

  try {
    const userId = request.oidc.user?.sub
    if (!userId) {
      return response
        .status(400)
        .json({ authenticated: false, completedLevels: [] })
    }

    const doc = await infoCollection.findOne({ userId })
    const completedLevels = Array.isArray(doc?.completedLevels)
      ? doc.completedLevels
      : []

    response.json({ authenticated: true, completedLevels })
  } catch (err) {
    console.error("Error fetching level progress", err)
    response
      .status(500)
      .json({ authenticated: true, completedLevels: [], error: "db_error" })
  }
})

// Track which levels a user has completed
app.post("/api/level-complete", requiresAuth(), async (request, response) => {
  try {
    const { levelIndex } = request.body

    const userId = request.oidc.user?.sub

    if (!userId) {
      return response.status(400).json({ error: "Missing user id" })
    }

    await infoCollection.updateOne(
      { userId },
      { $addToSet: { completedLevels: levelIndex } },
      { upsert: true }
    )

    response.json({ ok: true })
  } catch (err) {
    console.error("Error updating level progress", err)
    response.status(500).json({ error: "Internal server error" })
  }
})

app.get("/levelselect", (request, response) => {
  sendFile(response, "public/levelselect.html")
})

app.get("/game", (request, response) => {
  sendFile(response, "public/game.html")
})

app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
