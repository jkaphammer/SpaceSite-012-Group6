// Import HERE
// ************

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
const loader = new Loader({
  apiKey: process.env.GOOGLE_KEY,
  version: "weekly",
  ...additionalOptions,
});

function initMap(latitude, longitude) {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: latitude, lng: longitude},
    zoom: 0
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
    initMap(results.data.iss_position.latitude, results.data.iss_position.longitude)

  }) .catch(function (err) {
    console.log(err);
  });
}

// Dashboard - Solar Flares API
const solarAPIKEY = "kcfeqGsFGFrhNQb77BVpNbAj7RVmlHszKvbdsOPE"
function getSolarFlareAPI() {
  var solarFlares;
  axios({
    url: `https://api.nasa.gov/DONKI/FLR?api_key=${solarAPIKEY}`,
    method: "GET",
    datatype: "json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  })

  .then(results => {
    console.log(results.data);
    solarFlares = results.data;
    return solarFlares;
  }) .catch(function (err) {
    console.log(err);
  });
}

// API routes HERE
// ***************

app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /login route in the API
});

app.get('/register', (req, res) => {
  res.render('pages/register');
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

    user.username = data.username;
    user.password = data.password;

    res.redirect('/login')
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/register');
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', (req, res) => {

  const query = `SELECT * FROM users WHERE username = '${req.body.username}';`;

  db.one(query)
  .then(async (data) =>{
    const match = await bcrypt.compare(req.body.password, data.password);

    if(match == true){
      user.username = req.body.username;
      user.password = req.body.password;
      
      req.session.user = user;
      req.session.save();
      res.redirect('/home');
    }else{
      throw new Error('Incorrect username or password.');
    }
  })
  .catch((err)=>{
    res.redirect('/register');
    console.log(err);
  });

});

app.get('/dashboard', (req, res) => {
  
  const solarresult = getSolarFlareAPI();
  res.render('pages/dashboard', {solarFlare: solarresult});
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





//functions for NASA picture of the day space API

app.get("pages/home", (req, res) => {
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

// Test/Lab11
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});


module.exports = app.listen(3000);
console.log('Server is listening on port 3000');