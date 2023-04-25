let map;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const worldCenter = { lat: 0, lng: 0 }; 

    const map = new google.maps.Map(document.getElementById('map'), {
        center: worldCenter,
        zoom: 1
    });

    var myLatLng = { lat: -15.5806, lng: -60.7206 }; //add iss location, currently using sample location
    
    new google.maps.Marker({
        position: myLatLng,
        map,
        title: "ISS",
    });
}