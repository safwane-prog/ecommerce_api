from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Product)
admin.site.register(ColorProduct)
admin.site.register(SizeProduct)
admin.site.register(CategoryProduct)
admin.site.register(Category)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(Subscribe)
admin.site.register(Contact)
admin.site.register(Review)
admin.site.register(ShippingAddress)
admin.site.register(Wishlist)
admin.site.register(Coupon)
admin.site.register(Banner)
admin.site.register(Discount)
admin.site.register(PrivacyPolicy)
admin.site.register(SiteExperienceReview)
admin.site.register(AdminReply)
admin.site.register(Notification)

