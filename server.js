require("dotenv").config()

const express = require("express"),
      fs = require("fs"),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
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
  baseURL: 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

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

app.get("/levelone", (request, response) => {
  sendFile(response, "public/levelone.html")
})

app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
