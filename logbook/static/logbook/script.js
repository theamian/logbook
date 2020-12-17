//c/p from django docs
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

function deleteBtnListener(button) {
    button.addEventListener("click", deleting);
}

function deleting(click) {
    let id = click.target.parentElement.id;

    fetch("/delete", {
        method: "POST",
        body: JSON.stringify({
            id: id,
        }),
        headers: { "X-CSRFToken": csrftoken }
    })
    .then(response => response.json())
    .then(data => {
        if(data.ok) {
            click.target.parentElement.style.display = "none";
        }
    })
    .catch(error => console.error("Error:", error))
}


//Google maps below:

let logmap;
let map;

let searchMap = function() {
    // JS API is loaded and available

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3, lng: 7 },
        zoom: 2.3,
      });

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.BOTTOM].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
      });

    let markers = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
    
        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          const icon = {
            url: "static/logbook/images/snorkel.svg",
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
          };

          // Create a marker for each place.
          markers.push(
            new google.maps.Marker({
              map,
              icon,
              title: place.name,
              position: place.geometry.location,
            })
          );
    
          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
          console.log(place.geometry.location.lat())
          console.log(place.geometry.location.lng())
          console.log(place.address_components[0].short_name)
          console.log(place.address_components[3].long_name)
        });
        map.fitBounds(bounds);
      });
      console.log(window.location.pathname.replace(/\//,""))
};

let initMap = function() {

  logmap = new google.maps.Map(document.getElementById("logmap"), {
    center: { lat: 3, lng: 7 },
    zoom: 2.3,
  });

  fetch("/mapmark", {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken }
    })
    .then(response => response.json()) 
    .then(data => {
        for(let i=0; i<data.length; i++) {
            pos = { lat: Number(data[i].lat), lng: Number(data[i].lng) }
            let tempMark = new google.maps.Marker({
                position: { lat: pos.lat, lng: pos.lng },
                map: logmap,
                title: `${data[i]["town"]}`,
            });

            let info = new google.maps.InfoWindow({
                content: `<b>${data[i]["town"]}</b><br>
                        Number of dives: ${data[i]["count"]}<br>
                        Last dive: ${data[i]["last_dive"]}`
            });

            tempMark.addListener("click", () => info.open(logmap, tempMark));
        }
    })
    .catch(error => console.error("Error:", error))
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button").forEach(deleteBtnListener);
  let path = window.location.pathname.replace(/\//,"")

  if(path === "log") initMap();
  if(path === "add") searchMap();
});