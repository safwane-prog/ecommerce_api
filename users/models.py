from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True, default='profile_pictures/default.png')
    is_admin = models.BooleanField(default=False)

    def delete(self, *args, **kwargs):
        if self.username == 'superadmin':
            raise Exception("لا يمكن حذف المستخدم الأدمن الافتراضي.")
        super().delete(*args, **kwargs)

    
    def __str__(self):
        return self.username

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='userprofile')
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.user.username
    


