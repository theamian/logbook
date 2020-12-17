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

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button").forEach(deleteBtnListener);
});

//Google maps below:

let map;

// Attach your callback function to the `window` object
window.initMap = function() {
    // JS API is loaded and available

    split = { lat: 43.50785638619255, lng: 16.473769612946434 } 
    map = new google.maps.Map(document.getElementById("map"), {
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
                map: map,
                title: `${data[i]["town"]}`,
            });

            let info = new google.maps.InfoWindow({
                content: `<b>${data[i]["town"]}</b><br>
                            Number of dives: ${data[i]["count"]}<br>
                            Last dive: ${data[i]["last_dive"]}`
            });

            tempMark.addListener("click", () => info.open(map, tempMark));
        }
    })
    .catch(error => console.error("Error:", error))
};

