# Generated by Django 3.1.4 on 2021-01-05 23:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logbook', '0003_auto_20201218_1443'),
    ]

    operations = [
        migrations.AlterField(
            model_name='logentry',
            name='lat',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='logentry',
            name='lng',
            field=models.FloatField(),
        ),
    ]