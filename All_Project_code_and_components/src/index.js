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
  name: undefined,
  email: undefined,
  birthday: undefined,
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

console.log("PRE-SOLAR-FUNC")
// Dashboard - Solar Flares API
const solarAPIKEY = process.env.API_KEY
function getSolarFlareAPI() {
  var solarFlares;
  axios({
    url: `https://api.nasa.gov/DONKI/FLR?api_key=${process.env.API_KEY}`,
    method: "GET",
    datatype: "json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  })
  

  .then(results => {
    solarFlares = results;
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
  res.redirect('/home'); //this will call the /login route in the API
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/register', async (req, res) => {
  const { name, email, password, birthday } = req.body;

  const hash = await bcrypt.hash(req.body.password,10);
  const query = {
    text: 'INSERT INTO users (name, email, password, birthday) VALUES ($1, $2, $3, $4) RETURNING *',
    values: [name, email, hash, birthday],
  };
  
  db.one(query)
  .then((data) =>{

    user.name = data.name;
    user.email = data.email;
    user.birthday = data.birthday;
    req.session.user = user;
    req.session.save();
     
    res.render('pages/login', {message: 'Registered Successfully'});
  })
  .catch((err) => {
    console.log(err);
    res.render('pages/register', {message: 'Try again with a different email'});
  });
});

app.post('/login', (req, res) => {

  const query = `SELECT * FROM users WHERE users.email = '${req.body.email}';`;

  db.one(query)
  .then(async (data) =>{
    const match = await bcrypt.compare(req.body.password, data.password);

    if(match){
      console.log(match);
      user.email = req.body.email;
      user.name = req.body.name;
      user.birthday = req.body.birthday;
      
      req.session.user = user;
      req.session.save();
      res.redirect('/home');
    }else{
      res.render('pages/login', {message: 'Incorrect email or password'});
    }

  })
  .catch((err)=>{
    res.redirect('/register');
    console.log(err);
  });

});

// // Authentication Middleware.
// const auth = (req, res, next) => {
//   if (!req.session.user) {
//     // Default to login page.
//     return res.redirect('/login');
//   }
//   next();
// };
// // Authentication Required
// app.use(auth);


app.get('/dashboard', async (req, res) => {
  
  const solarresult =   await axios({
    url: `https://api.nasa.gov/DONKI/FLR?api_key=${process.env.API_KEY}`,
    method: "GET",
    datatype: "json",
    headers: {
      'Accept-Encoding': 'application/json',
    },
  });
  res.render('pages/dashboard', {solarFlares: solarresult});
});

app.get('/google-sky', (req, res) => {
  res.render('pages/googleSky');
});

app.get('/google-moon', (req, res) => {
  res.render('pages/googleMoon');
});

app.get('/google-mars', (req, res) => {
  res.render('pages/googleMars');
});


app.get('/iss', (req, res) => {
  res.render('pages/iss');
});

app.post("/comment", (req, res) => {
 // writing an api where when the comment form is submitted, 
 // it puts the comment into the comment table database with the comment, and email

 let date = new Date().toJSON().slice(0, 10);

 console.log(date)

 const query = {
  text: `INSERT INTO comments (email, comment, pictureDate) VALUES ($1, $2, $3) RETURNING *;`, // the comments table doesn't exist?
  values: [req.body.email, req.body.comment, date], 
};

  db.one(query)
  .then((data) =>{
    console.log('Comment Submitted!')
    res.redirect('/home');
  })
  .catch((err) => {
    console.log('Error Not sumbitted comment');
    console.log(err);
    res.redirect('/home');
  });
});

app.get('/profile', (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }
  console.log(req.session.user);
  const query = `SELECT name, email, birthday FROM users WHERE users.email = '${req.session.user.email}';`;

  db.one(query)
    .then((data) => {
      res.render('pages/profile', { name: data.name, email: data.email, birthday: data.birthday });
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/login');
    });
});


app.get("/home", async (req,res) => {
  let date = new Date().toJSON().slice(0,10);

  const query = `SELECT * FROM comments WHERE pictureDate = '${date}';`;

  db.any(query)
  .then(results => {
    console.log('rendered home with successful results?', results)
    res.render('pages/home', {results});
  })
  .catch((err) => {
    console.log(err);
    res.render('pages/home', {results:[]});
  });
});

app.get('/pictures', (req, res) => {
  const query = `SELECT picture_url FROM user_likes WHERE email = '${req.session.user.email}';`
  console.log("PICTURRES")
  axios({
    url: `https://images-api.nasa.gov/album/Apollo?api_key=${solarAPIKEY}`,
    method: "GET",
    datatype: "json",
    headers: {
        'Accept-Encoding': 'application/json',
    },
})
.then(async results => {
  db.any(query)
  .then(dbquery => {
    console.log(dbquery.picture_url);
    console.log(results.data.collection.items[1].links[0].href)
    let liked = dbquery.map(obj => obj.picture_url);
    console.log(req.session.user);
    res.render('pages/pictures', {results:results.data.collection.items, liked:liked});
  })
  // console.log(results.data.collection.items[0].data[0].title);
    // const likequery = await db.query(`SELECT * FROM user_likes WHERE email = '${req.session.user.email}'`)
    // console.log(likequery)
   
  })
});


app.post('/like', (req, res) => {
  console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
  picturelink = req.body.picturelink;
  query = `INSERT INTO user_likes (email, picture_url) VALUES ($1, $2);`
  db.query(query, [req.session.user.email, picturelink])
  .then(pictures => {
    res.redirect('/pictures')
  })
  .catch(err => {
    console.log(err)
  })
})


app.post('/pictures/unlike', (req, res) => {
  console.log('sdfsfdsdfsdsfsdfs')
  query = `DELETE FROM user_likes WHERE email = '${req.session.user.email}' AND picture_url = '${req.body.picturelink}';`
  db.query(query)
  .then(pictures => {
    res.redirect('/pictures')
  })
  .catch(err => {
    console.log(err)
  })
})


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

module.exports = app.listen(3000);
console.log('Server is listening on port 3000');