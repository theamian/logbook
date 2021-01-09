from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
import json
import datetime

from .models import *

gmpas_api_source = f"https://maps.googleapis.com/maps/api/js?key={settings.GMAPS_API}&callback=initMap&libraries=places&v=weekly"

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
    try:
        del request.session['logbook']
    except KeyError:
        pass
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password == "":
            return render(request, "logbook/register.html", {
                "message": "You must set a password"
            })
        if password != confirmation:
            return render(request, "logbook/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "logbook/register.html", {
                "message": "Username already taken."
            })
        except ValueError as e:
            return render(request, "logbook/register.html", {
                "message": e
            })
        login(request, user)
        return HttpResponseRedirect(reverse("log"))
    else:
        return render(request, "logbook/register.html")

@login_required(login_url="login")
def log(request):

    gmpas_api_log= f"https://maps.googleapis.com/maps/api/js?key={settings.GMAPS_API}&callback=initMap&libraries=places&v=weekly"

    try:
        logbook = LogEntry.objects.all().filter(diver=request.user)
    except:
        logbook = None
    
    return render(request, "logbook/log.html", {
        "form": LogForm(),
        "logbook": logbook,
        "api": gmpas_api_log
    })

@login_required(login_url="login")
def add(request):

    gmpas_api_add= f"https://maps.googleapis.com/maps/api/js?key={settings.GMAPS_API}&callback=searchMap&libraries=places&v=weekly"


    try:
        logbook = LogEntry.objects.all().filter(diver=request.user)
    except:
        logbook = None

    if request.method == "POST":
        entryform = LogForm(request.POST)
        if entryform.is_valid():
            entry = entryform.save(commit=False)
            entry.diver = request.user
            entry.save()
        else:
            return render(request, "logbook/add.html", {
                "form": entryform,
                "logbook": logbook,
                "api": gmpas_api_add
            })
    
    return render(request, "logbook/add.html", {
        "form": LogForm(),
        "logbook": logbook,
        "api": gmpas_api_add
    })

@login_required(login_url="login")
def mapmark(request):
    if request.method == "POST":
        try:
            logbook = LogEntry.objects.all().filter(diver=request.user)

            lats = LogEntry.objects.order_by().values("lat").distinct()
            lngs = LogEntry.objects.order_by().values("lng").distinct()
            locations = []
            i = 0

            for lat_row in lats:
                for lng_row in lngs:
                    try:
                        l_temp = logbook.filter(lat=lat_row["lat"]).filter(lng=lng_row["lng"]).order_by("-date")
                        if not l_temp:
                            raise Exception
                        locations.append({})
                        locations[i]["lat"] = lat_row["lat"]
                        locations[i]["lng"] = l_temp[0].lng
                        locations[i]["town"] = l_temp[0].town
                        locations[i]["count"] = l_temp.count()
                        locations[i]["last_dive"] = l_temp[0].date.strftime("%d/%m/%Y")
                        i = i+1
                    except:
                        continue

            return JsonResponse(locations, safe=False)

        except:
            return JsonResponse({
                "ok": False
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