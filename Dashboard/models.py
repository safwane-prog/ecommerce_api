from django.db import models

# Admin Profile
class AdminProfile(models.Model):
    Admin_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    username = models.CharField(max_length=100)
    email = models.EmailField()
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


# Ecommerce Site Settings - Home
class EcommerceHomeSettings(models.Model):
    site_title = models.CharField(max_length=200)
    site_description = models.TextField()
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)
    welcome_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Home Settings"
        verbose_name_plural = "Home Settings"

    def __str__(self):
        return self.site_title

class EcommerceContactSettings(models.Model):
    address = models.TextField(help_text="Full business address")
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    primary_email = models.EmailField()
    secondary_email = models.EmailField(blank=True, null=True)

    # روابط التواصل الاجتماعي
    instagram = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    whatsapp = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contact Settings"
        verbose_name_plural = "Contact Settings"

    def __str__(self):
        return f"Contact Info - {self.city}"



