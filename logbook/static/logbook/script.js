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
  console.log(click.target.parentElement.parentElement.parentElement)
    let id = click.target.parentElement.parentElement.parentElement.id;

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
            // click.target.parentElement.parentElement.style.display = "none";
            click.target.parentElement.parentElement.parentElement.classList.add("disappear");
            setTimeout(() => {
              click.target.parentElement.parentElement.parentElement.style.display = "none";
            }, 700);
        }
    })
    .catch(error => console.error("Error:", error))
}

function clearform() {
  document.querySelector("#id_lat").value = "";
  document.querySelector("#id_lng").value = "";
  document.querySelector("#id_town").value = "";
  document.querySelector("#id_country").value = "";
}

//Google maps below:

let logmap;
let map;

let searchMap = function() {

  clearform();

    // JS API is loaded and available
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3, lng: 7 },
        zoom: 2.3,
      });

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    input.value = "";
    const searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.BOTTOM].push(input);
    window.addEventListener("load", () => {
      map.controls[google.maps.ControlPosition.BOTTOM].push(input);
      input.style.display = "block";
    });


    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
      });

    let markers = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {

      clearform();

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

        let len = place.address_components.length;
        for(let i = 0; i < len; i++) {
          if(place.address_components[i].types.includes("locality")) {
            document.querySelector("#id_town").value = place.address_components[i].short_name;
            continue;
          }
          if(place.address_components[i].types.includes("country")) {
            document.querySelector("#id_country").value = place.address_components[i].long_name;
            continue;
          }
        }
        document.querySelector("#id_lat").value = place.geometry.location.lat();
        document.querySelector("#id_lng").value = place.geometry.location.lng();
      });
      map.fitBounds(bounds);
    });

  const geocoder = new google.maps.Geocoder();
  map.addListener("click", (mapsMouseEvent) => {

    clearform();

    const latlng = mapsMouseEvent.latLng;
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          map.setCenter(latlng);
          if(map.getZoom() < 10) map.setZoom(10);
          let len = results[0].address_components.length;
          for(let i = 0; i < len; i++) {
            if(results[0].address_components[i].types.includes("locality")) {
              document.querySelector("#id_town").value = results[0].address_components[i].short_name;
              continue;
            }
            if(results[0].address_components[i].types.includes("country")) {
              document.querySelector("#id_country").value = results[0].address_components[i].long_name;
              continue;
            }
          }
          document.querySelector("#id_lat").value = latlng.lat();
          document.querySelector("#id_lng").value = latlng.lng();
        } 
        else {
          //windows.alert("No results found");
        }
      } 
      else {
        //window.alert("Geocoder failed due to: " + status);
      }
    });
    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

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
        position: latlng,
      })
    );
  });
}

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
                icon: {
                  url: "static/logbook/images/snorkel.svg",
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(25, 25),
                },
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

let splashing = function() {
  let splash_btn = document.querySelector("#splash_btn");
  let join_btn = document.querySelector("#splash_join");
  let login_btn = document.querySelector("#splash_login");
  let main = document.querySelector("#splash_title_container");

  main.classList.add("fadein");
  setTimeout(() => {
    splash_btn.classList.add("appear");
  }, 3000);

  splash_btn.addEventListener("click", () => {
    splash_btn.style.display = "none";
    document.querySelector("#splash_btns_container").style.display = "flex";
    join_btn.classList.add("slideleft");
    login_btn.classList.add("slideright");
  });

  join_btn.addEventListener("click", () => {
    location.href = "/register";
  });

  login_btn.addEventListener("click", () => {
    location.href = "/login";
  });
}

let loggingin = function() {
  document.querySelector("body").classList.add("login_body");
}

let registering = function() {
  document.querySelector("body").classList.add("register_body");
}

let logpaging = function() {
  document.querySelector("body").classList.add("log_body");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button").forEach(deleteBtnListener);
  let path = window.location.pathname.replace(/\//,"")
  if(path === "log") {
    initMap();
    logpaging();
  }
  if(path === "add") searchMap();
  if(path === "") splashing();
  if(path === "login") loggingin();
  if(path === "register") registering();

});