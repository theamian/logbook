from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json

from .models import *

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
            })
    
    return render(request, "logbook/log.html", {
        "form": LogForm(),
        "logbook": logbook,
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