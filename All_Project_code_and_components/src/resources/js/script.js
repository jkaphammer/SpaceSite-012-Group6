let map;

async function initMap() {
    const position = { lat: 0, lng: 0};
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerView } = await google.maps.importLibrary("marker");
  
    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
      zoom: 1,
      center: position,
      mapId: "DEMO_MAP_ID",
    });
    var myLatLng = { lat: -15.5806, lng: -60.7206 }; //add iss location, currently using sample location
  
    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerView({
      map: map,
      position: myLatLng,
      title: "ISS",
    });
}

initMap();