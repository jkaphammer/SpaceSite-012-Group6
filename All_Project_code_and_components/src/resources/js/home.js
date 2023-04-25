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