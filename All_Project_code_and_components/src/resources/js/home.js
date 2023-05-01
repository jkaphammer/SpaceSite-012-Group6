//functions for NASA picture of the day space API
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
     res.render('pages/home', {message: 'Comment Submitted!'});
     console.log('Comment Submitted!')
   })
   .catch((err) => {
     console.log('Error Not sumbitted comment');
     console.log(err);
     res.render('pages/home', {results:[]});
   });
 });

 app.get("/home", async (req,res) => {
  let date = new Date().toJSON().slice(0,10);

  const query = `SELECT * FROM comments WHERE pictureDate = '${date}';`;

  db.one(query)
  .then((results) => {
    res.render('pages/home', {results});
  })
  .catch((err) => {
    console.log(err);
    res.render('pages/home', {results:[]});
  });
});