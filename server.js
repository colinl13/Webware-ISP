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
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');


// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to serve static files from public directory
app.use(express.static(dir))

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'BaK7PdN8sxqh8t2mV136G00tl4gDZDWY',
  issuerBaseURL: 'https://dev-6ipcurrm0exoqohw.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});


// Route to serve the main HTML page; always render and let client show login/logout
app.get("/", (request, response) => {
  sendFile(response, "public/index.html")
})

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

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