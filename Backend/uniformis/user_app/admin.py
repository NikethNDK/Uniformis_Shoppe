from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile

class CustomUserAdmin(UserAdmin):
    # Define the fields to be displayed in the list view
    list_display = ('email', 'first_name', 'last_name', 'username', 'last_login', 'date_joined', 'is_active', 'is_admin', 'is_superadmin')
    
    # Define the fields that can be used for searching
    search_fields = ('email', 'username', 'first_name', 'last_name')
    
    # Define the filter options in the admin
    list_filter = ('is_active', 'is_admin', 'is_superadmin')

    # Read-only fields (non-editable in admin)
    readonly_fields = ('date_joined', 'last_login')

    # Organize the layout of the form in the admin interface
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'username', 'phone_number')}),
        ('Permissions', {'fields': ('is_admin', 'is_active', 'is_staff', 'is_superadmin')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Set ordering of users
    ordering = ('email',)

    # Required to avoid issues with Django's user model replacement
    filter_horizontal = ()


class UserProfileAdmin(admin.ModelAdmin):
    # Define the fields to be displayed in the list view
    list_display = ('user', 'profile_picture')
    
    # Define the fields that can be used for searching
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    
    # Organize the layout of the form in the admin interface
    fieldsets = (
        (None, {'fields': ('user', 'profile_picture')}),
    )

# Register the models and customized admin views
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
