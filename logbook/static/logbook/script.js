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
            console.log("jee")
            click.target.parentElement.style.display = "none";
        }
    })
    .catch(error => console.error("Error:", error))
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button").forEach(deleteBtnListener);
});


// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC6MWycFzNEGjRrtnzeTmOnezWu6KNEs88&callback=initMap';
script.defer = true;

let map;

// Attach your callback function to the `window` object
window.initMap = function() {
    // JS API is loaded and available

    split = { lat: 43.50785638619255, lng: 16.473769612946434 } 
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 3, lng: 7 },
        zoom: 2.3,
      });

    for(let i = -5; i > -20; i = i - 5) {

        let tempMark = new google.maps.Marker({
            position: {lat: split.lat + i, lng: split.lng + i },
            map: map,
            title: `Title of i=${i}`,
        });

        let info = new google.maps.InfoWindow({
            content: "alo brale"
            });

        // tempMark.addListener("click", () => {
        //     info.open(map, tempMark)
        // });

        tempMark.addListener("click", infoing);

        function infoing() {
            //console.log(event.latLng.toJSON());

            info.open(map, tempMark);
        }
    
    }

    //console.log(marker.getPosition().toJSON())
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
