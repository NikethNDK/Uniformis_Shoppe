# Generated by Django 5.1.4 on 2025-01-30 02:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='productsizecolor',
            name='price',
            field=models.DecimalField(decimal_places=2, default=599, max_digits=10),
            preserve_default=False,
        ),
    ]
