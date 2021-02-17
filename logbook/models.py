from django.contrib.auth.models import AbstractUser
from django.contrib.admin.widgets import AdminDateWidget
from django.db import models
from django.forms import ModelForm
from django import forms

class User(AbstractUser):
    pass

class LogEntry(models.Model):
    diver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dove")
    date = models.DateField(auto_now=False, auto_now_add=False)
    town = models.CharField(max_length=200)
    country = models.CharField(max_length=200)
    lat = models.FloatField()
    lng = models.FloatField()
    buddy = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name_plural = "LogEntries"

class LogForm(ModelForm):
    
    date = forms.DateField(widget=forms.DateInput(attrs={"type":"text", "placeholder":"select a date", "onfocus":"(this.type = 'date')"}
                        ))

    class Meta:
        model = LogEntry
        fields = ("date", "town", "country", "buddy", "lat", "lng")
        widgets = {
            "lat": forms.HiddenInput(),
            "lng": forms.HiddenInput(),
        }

