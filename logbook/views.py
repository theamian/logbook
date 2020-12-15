from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json

from .models import *

gmpas_api_source = f"https://maps.googleapis.com/maps/api/js?key={settings.GMAPS_API}&callback=initMap&libraries=&v=weekly"

def index(request):

    # if authenticated takes them to the logbook
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("log"))

    else:
        return render(request, "logbook/splash.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("log"))
        else:
            return render(request, "logbook/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "logbook/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("log"))
    else:
        return render(request, "logbook/register.html")

@login_required(login_url="login")
def log(request):
    try:
        logbook = LogEntry.objects.all().filter(diver=request.user)
    except:
        logbook = None

    lats = LogEntry.objects.order_by().values("lat").distinct()
    lngs = LogEntry.objects.order_by().values("lng").distinct()

    locations = {}

    for lat_row in lats:
        for lng_row in lngs:
            # logbook.filter(lat=lat_row["lat"]).filter(lng=lng_row["lng"])
            locations["lat"] = lat_row["lat"]
            

    if request.method == "POST":
        entryform = LogForm(request.POST)
        if entryform.is_valid():
            entry = entryform.save(commit=False)
            entry.diver = request.user
            entry.save()
        else:
            return render(request, "logbook/log.html", {
                "form": entryform,
                "logbook": logbook,
                "api": gmpas_api_source
            })
    
    return render(request, "logbook/log.html", {
        "form": LogForm(),
        "logbook": logbook,
        "api": gmpas_api_source
    })

@login_required(login_url="login")
def delete(request):
    id = json.loads(request.body)["id"]
    
    try:
        entry = LogEntry.objects.get(id=id)
        entry.delete()
    except:
        return JsonResponse({
                        "ok": False,
                    })

    return JsonResponse({
                        "ok": True,
                    })