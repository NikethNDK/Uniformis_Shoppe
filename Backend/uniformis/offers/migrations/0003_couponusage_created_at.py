# Generated by Django 5.1.4 on 2025-02-21 16:08

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0002_alter_offer_category_alter_offer_products'),
    ]

    operations = [
        migrations.AddField(
            model_name='couponusage',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
