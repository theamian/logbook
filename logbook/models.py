from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ModelForm
from django import forms
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget

class User(AbstractUser):
    pass

class LogEntry(models.Model):
    diver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dove")
    date = models.DateField(auto_now=False, auto_now_add=False)
    town = models.CharField(max_length=200)
    country = CountryField(countries_flag_url='#')
    lat = models.DecimalField(max_digits=16, decimal_places=14)
    lng = models.DecimalField(max_digits=17, decimal_places=14)
    28.51294614131052, 34.51415840811709
    buddy = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name_plural = "LogEntries"

class LogForm(ModelForm):

    date = forms.DateField(input_formats=["%d/%m/%Y"],
                            widget=forms.DateInput(attrs={"placeholder" : "dd/mm/yyyy"}
                            ))

    class Meta:
        model = LogEntry
        fields = ("date", "town", "country", "buddy")
        widgets = {'country': CountrySelectWidget()}

