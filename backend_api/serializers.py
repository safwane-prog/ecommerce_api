from rest_framework import serializers
from .models import *


# ======================================== Product ======================================================================================================================================
class ColorProductserializers(serializers.ModelSerializer):
    class Meta:
        model = ColorProduct
        fields = '__all__'
# ======================================== Size ======================================================================================================================================

class SizeProductserializers(serializers.ModelSerializer):
    class Meta:
        model = SizeProduct
        fields = '__all__'
# ======================================== Category Products ======================================================================================================================================

class CategoryProductserializers(serializers.ModelSerializer):
    class Meta:
        model = CategoryProduct
        fields = '__all__'


class Categoryserializers(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class Productserializers(serializers.ModelSerializer):
    color = ColorProductserializers(read_only=True)  # No `many=True`
    size = SizeProductserializers(read_only=True)    # No `many=True`
    Clothing_Categories = CategoryProductserializers(read_only=True, many=True)  # many=True for M2M
    Category = Categoryserializers(read_only=True)   # No `many=True`

    class Meta:
        model = Product
        fields = ['id','title', 'price', 'old_price', 'discount', 'description', 'stock',
                    'image_1', 'image_2', 'image_3', 'image_4', 'color', 'size',
                    'Clothing_Categories', 'Category']


class ProductserializersAdmin(serializers.ModelSerializer):
    clothing_categories_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'old_price', 'discount', 'description', 'stock',
                 'image_1', 'image_2', 'image_3', 'image_4', 'color', 'size',
                 'Category', 'clothing_categories_ids']

    def create(self, validated_data):
        clothing_categories_ids = validated_data.pop('clothing_categories_ids', [])
        
        product = Product.objects.create(**validated_data)
        
        if clothing_categories_ids:
            clothing_categories = CategoryProduct.objects.filter(id__in=clothing_categories_ids)
            product.Clothing_Categories.set(clothing_categories)
        
        return product

    def update(self, instance, validated_data):
        clothing_categories_ids = validated_data.pop('clothing_categories_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if clothing_categories_ids is not None:
            clothing_categories = CategoryProduct.objects.filter(id__in=clothing_categories_ids)
            instance.Clothing_Categories.set(clothing_categories)
        
        return instance


# ======================================== Color ======================================================================================================================================

# ======================================== CartItem ======================================================================================================================================


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, data):
        try:
            product = Product.objects.get(id=data['product_id'])
            data['product'] = product
        except Product.DoesNotExist:
            raise serializers.ValidationError("المنتج غير موجود")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        cart, created = Cart.objects.get_or_create(user=user)
        product = validated_data['product']
        quantity = validated_data['quantity']

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        return item



class CartItemSerializer(serializers.ModelSerializer):
    product = Productserializers()
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'get_total_price', 'added_at']
        



# =============== Add To Wishlist Serializer ==========

class AddToWishlistSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()

    def validate(self, data):
        try:
            product = Product.objects.get(id=data['product_id'])
            data['product'] = product
        except Product.DoesNotExist:
            raise serializers.ValidationError("المنتج غير موجود")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, product=product)
        return wishlist_item
    

# ======================================== Category ======================================================================================================================================

class SubscribeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscribe
        fields = ['id', 'user', 'email', 'subscribed_at']
        read_only_fields = ['id', 'subscribed_at', 'user']


class ContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


# orders/serializers.py
from users.serializers import CustomUserSerializer

class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = CustomUserSerializer(read_only=True)  # ✅ بيانات المستخدم كاملة

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'items', 'total_price',
            'first_name', 'last_name', 'email', 'phone',
            'address', 'created_at', 'is_paid', 'status'
        ]



class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'


# serializers.py
from rest_framework import serializers
from backend_api.models import Review, Product

class AddReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'rating', 'comment']

    def validate(self, data):
        user = self.context['request'].user
        product = data.get('product')

        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("لقد قمت بتقييم هذا المنتج من قبل.")
        
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)



from rest_framework import serializers
from backend_api.models import Review

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']


# serializers.py
from rest_framework import serializers
from .models import SiteExperienceReview

class SiteExperienceReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteExperienceReview
        fields = ['rating', 'comment', 'created_at']



class SiteExperienceReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # يعرض اسم المستخدم بدل ID

    class Meta:
        model = SiteExperienceReview
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

# serializers.py
from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # يعرض اسم المستخدم بدل ID
    product = serializers.StringRelatedField()  # يعرض اسم المنتج بدل ID

    class Meta:
        model = Review
        fields = '__all__'


# serializers.py

from rest_framework import serializers
from backend_api.models import Contact, AdminReply

class AdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminReply
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    replies = AdminReplySerializer(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = '__all__'




class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = '__all__'





class DiscountSerializer_2(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'

# serializers.py
from rest_framework import serializers
from .models import Coupon, CouponUsage

class CouponSerializer(serializers.ModelSerializer):
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_percent', 'start_date', 'end_date', 'is_active', 'usage_count']
    
    def get_usage_count(self, obj):
        return CouponUsage.objects.filter(coupon=obj).count()


from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
