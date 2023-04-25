// Import HERE
// ************

var cors = require('cors')
const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

const user = {
  username: undefined,
  password: undefined,
};

// Connect to DB HERE
// *************

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
  };

  const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
// app.use(cors())

app.use(express.static("resources")); 

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//FUNCTIONS
// ****************

function getSpacePeople() {
  var spacePeople;
  axios({
    url:"http://api.open-notify.org/astros.json",
    method:"GET",
    datatype:"json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  })
  .then(results => {
    console.log(results.data);
    spacePeople = results.data;
    return spacePeople;
  }) .catch(function (err) {
    console.log(err);
  });
}

async function getIssLocation() {
  //var issLocation;
  axios({
    url:"http://api.open-notify.org/iss-now.json",
    method:"GET",
    datatype:"json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  })
  .then(results => {
    console.log(results.data);
    //issLocation = results.data;
    //initMap(results.data.iss_position.latitude, results.data.iss_position.longitude)
    return results.data;

  }) .catch(function (err) {
    console.log(err);
  });
}
console.log("PRE-SOLAR-FUNC")
// Dashboard - Solar Flares API
const solarAPIKEY = "kcfeqGsFGFrhNQb77BVpNbAj7RVmlHszKvbdsOPE"
function getSolarFlareAPI() {
  var solarFlares;
  console.log("PRE-AXIOS");
  axios({
    url: `https://api.nasa.gov/DONKI/FLR?api_key=${solarAPIKEY}`,
    method: "GET",
    datatype: "json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  })
  

  .then(results => {
    console.log("POST-AXIOS")
    console.log(results);
    solarFlares = results;
    console.log(solarFlares);
    return solarFlares;
  }) .catch(function (err) {
    console.log(err);
  });
}

// API routes HERE
// ***************
// Test/Lab11
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /login route in the API
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(req.body.password,10);
  const query = {
    text: 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    values: [name, email, hash],
  };
  
  db.one(query)
  .then((data) =>{

    user.username = data.name;
    user.password = data.password;
     
    res.render('pages/login', {message: 'Registered Successfully'});
  })
  .catch((err) => {
    console.log(err);
    res.render('/register');
  });
});

app.post('/login', (req, res) => {

  const query = `SELECT * FROM users WHERE users.email = '${req.body.email}';`;

  db.one(query)
  .then(async (data) =>{
    const match = await bcrypt.compare(req.body.password, data.password);

    if(match){
      console.log(match)
      user.email = req.body.email;
      user.username = req.body.name;
      
      req.session.user = user;
      req.session.save();
      res.render('pages/home', {message: 'logged in successfully'});
    }else{
      res.render('pages/login', {message: 'Incorrect email or password'});
    }

  })
  .catch((err)=>{
    res.render('pages/register');
    console.log(err);
  });

});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};
// Authentication Required
app.use(auth);


app.get('/dashboard', async (req, res) => {
  
  // const solarresult = await getSolarFlareAPI();
  const solarresult =   await axios({
    url: `https://api.nasa.gov/DONKI/FLR?api_key=${solarAPIKEY}`,
    method: "GET",
    datatype: "json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  });
  console.log("CHECKHERE");
  console.log(solarresult.data);
  res.render('pages/dashboard', {solarFlares: solarresult});
});

app.get('/google-sky', (req, res) => {
  res.render('pages/googleSky');
});


app.get("/home", (req, res) => {
  res.render("pages/home");
});

function contentLoader()
{
  sendApiReq();
};

async function sendApiReq() 
{
  let APIKEY = "kcfeqGsFGFrhNQb77BVpNbAj7RVmlHszKvbdsOPE";
  let res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${APIKEY}`);
  let data = await res.json();
  useApiData(data);
};

function useApiData(data)
{
  document.querySelector("#title").innerHTML += data.title;
  document.querySelector("#content").innerHTML += `<img src = "${data.url}" class = "main.img" /> <br/>`
  document.querySelector("#content").innerHTML += data.explanation;
}

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

module.exports = app.listen(3000);
console.log('Server is listening on port 3000');