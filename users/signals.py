from django.contrib.auth import get_user_model

def create_default_admin(sender, **kwargs):
    User = get_user_model()
    if not User.objects.filter(username='superadmin').exists():
        User.objects.create_superuser(
            username='superadmin',
            email='superadmin@example.com',
            password='@D3fAulT#Adm1n_2025!',
            is_admin=True,
            is_staff=True,      # <--- هذا ضروري لـ DRF IsAdminUser
            is_superuser=True,  # <--- هذا مهم كذلك
        )
