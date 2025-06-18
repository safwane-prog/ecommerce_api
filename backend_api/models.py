from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
# ==================================================================
class ColorProduct(models.Model):
    color = models.CharField(max_length=100)

    def __str__(self):
        return self.color
# ==================================================================
class SizeProduct(models.Model):
    size = models.CharField(max_length=100)

    def __str__(self):
        return self.size
# ==================================================================

class CategoryProduct(models.Model):
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.category

# ==================================================================

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="اسم الفئة")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="الرابط")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name="صورة الفئة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإضافة")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ['name']

    def __str__(self):
        return self.name

# ==================================================================

class Product(models.Model):
    title = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.DecimalField(max_digits=5, decimal_places=0, null=True, blank=True, verbose_name="الخصم (%)", default=None)
    description = models.TextField(null=True, blank=True, verbose_name="الوصف")
    stock = models.DecimalField(max_digits=10, decimal_places=0, default=1, null=True, blank=True)

    image_1 = models.ImageField(upload_to='product/', null=False, blank=True)
    image_2 = models.ImageField(upload_to='product/', null=True, blank=True)
    image_3 = models.ImageField(upload_to='product/', null=True, blank=True)
    image_4 = models.ImageField(upload_to='product/', null=True, blank=True)

    color = models.ForeignKey(ColorProduct, on_delete=models.SET_NULL, null=True, blank=True)
    size = models.ForeignKey(SizeProduct, on_delete=models.SET_NULL, null=True, blank=True)
    Clothing_Categories = models.ManyToManyField(CategoryProduct)    
    Category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    views = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def calculated_discount(self):
        if self.old_price and self.price:
            return round(((self.old_price - self.price) / self.old_price) * 100)
        return 0


# ==================================================================

class Discount(models.Model):
    discount_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Discount percentage, e.g. 20 for 20%"
    )
    delivery_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Delivery fee amount"
    )
    
    def __str__(self):
        return f"Discount: {self.discount_percent}% - Delivery Fee: ${self.delivery_fee}"


# ==================================================================

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart ({self.user.username})"
    
    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())
    
    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())


from django.utils import timezone
class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.FloatField(default=0)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"

    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and self.end_date:
            return self.start_date <= now <= self.end_date
        return True




class Order(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name  = models.CharField(max_length=150)
    last_name   = models.CharField(max_length=150)
    email       = models.EmailField()
    phone       = models.CharField(max_length=20)
    address     = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at  = models.DateTimeField(auto_now_add=True)
    is_paid     = models.BooleanField(default=False)
    STATUS_CHOICES = [
        ('pending', 'قيد المعالجة'),
        ('completed', 'مكتمل'),
        ('cancelled', 'ملغى'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"



class CartItem(models.Model):
    cart = models.ForeignKey(Cart, null=True, blank=True, on_delete=models.SET_NULL, related_name="items")
    order = models.ForeignKey('Order', null=True, blank=True, on_delete=models.CASCADE, related_name="items")  # 🔴 أضف هذا
    product = models.ForeignKey('backend_api.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"

    def get_total_price(self):
        return self.product.price * self.quantity



# ==================================================================

class Subscribe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class Contact(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True,related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    STATUS_CHOICES = [
        ('open', 'مفتوحة'),
        ('closed', 'مغلقة'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"Message from {self.first_name} {self.last_name} - {self.subject}"


class AdminReply(models.Model):
    contact_message = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='replies')
    reply = models.TextField()
    replied_at = models.DateTimeField(auto_now_add=True)
    replied_by = models.CharField(max_length=100)  # أو ربط بـ User لاحقًا
    class Meta:
        verbose_name = "رد الإدارة"
        verbose_name_plural = "ردود الإدارة"
        indexes = [
            models.Index(fields=['contact_message', 'replied_at']),
        ]
    def __str__(self):
        return f"Reply to: {self.contact_message.subject}"
# ==================================================================

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"

# ==================================================================

class ShippingAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.city}"



# ==================================================================

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='wishlists')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"



# ==================================================================


class CouponUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='CouponUsage')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'coupon')

    def __str__(self):
        return f"{self.user.username} used {self.coupon.code}"




# ==================================================================

class Banner(models.Model):
    title = models.CharField(max_length=200, null=True, blank=True)
    image = models.ImageField(upload_to='banners/')
    link = models.URLField(max_length=300, null=True, blank=True, help_text="رابط عند الضغط على الصورة")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Banner {self.id}"

# ==================================================================

class PrivacyPolicy(models.Model):
    title = models.CharField(max_length=255, default="سياسة الخصوصية")
    content = models.TextField(verbose_name="محتوى السياسة")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="آخر تعديل")

    def __str__(self):
        return self.title
    




# models.py
from django.db import models
from django.conf import settings

class SiteExperienceReview(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.rating}★"


class About(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    paragraph_1 = models.TextField()
    paragraph_2 = models.TextField(blank=True, null=True)
    paragraph_3 = models.TextField(blank=True, null=True)
    image_1 = models.ImageField(upload_to='about_images/', blank=True, null=True)

    def __str__(self):
        return self.title


from django.db import models
from .models import Order  # استورد جدول الطلبات حسب مكانه

class Notification(models.Model):
    message = models.CharField(max_length=255)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
