import os, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Project_E_commerce.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username="admin").exists():
    user = User.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="SuperUser#2025!Shop"
    )
    user.is_admin = True  # <-- هذا خاص بك أنت
    user.save()
    print("Admin created successfully.")
else:
    print("Admin already exists.")
