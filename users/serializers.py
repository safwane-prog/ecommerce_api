from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from backend_api.models import Product, Order, Review, Wishlist, Cart, CartItem,AdminReply,Contact
from .models import UserProfile, CustomUser

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    userprofile = UserProfileSerializer(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'userprofile')

    def create(self, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Cart.objects.create(user=user)
        UserProfile.objects.create(
            user=user,
            first_name=profile_data.get('first_name', ''),
            last_name=profile_data.get('last_name', ''),
            phone=profile_data.get('phone', ''),
            address=profile_data.get('address', '')
        )
        return user

class CustomUserSerializer(serializers.ModelSerializer):
    userprofile = UserProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone_number', 'date_of_birth', 'profile_picture', 'userprofile']

class CustomUserSerializer2(serializers.ModelSerializer):
    userprofile = UserProfileSerializer()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'email', 'phone_number', 'date_of_birth', 'profile_picture', 'userprofile']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data, password=password)
        Cart.objects.create(user=user)
        UserProfile.objects.create(user=user, **profile_data)
        return user

class ProductMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'image_1', 'discount']

class CartItemOrderSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'added_at']

class OrderSummarySerializer(serializers.ModelSerializer):
    items = CartItemOrderSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total_price', 'is_paid', 'created_at', 'items']

class UserReviewSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer()
    
    class Meta:
        model = Review
        fields = ['id', 'product', 'rating', 'comment', 'created_at']

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer()
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'added_at']

class UserProfileInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']

class AdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminReply
        fields = ['id', 'reply', 'replied_at', 'replied_by']

class ContactWithRepliesSerializer(serializers.ModelSerializer):
    replies = AdminReplySerializer(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = ['id', 'subject', 'message', 'created_at', 'replies']
from rest_framework import serializers
from .models import CustomUser


class CompleteUserProfileSerializer(serializers.ModelSerializer):
    profile = UserProfileInfoSerializer(source='userprofile')
    wishlist = WishlistItemSerializer(source='wishlists', many=True)
    orders = OrderSummarySerializer(many=True, source='order_set')
    reviews = UserReviewSerializer(many=True, source='review_set')
    contacts = ContactWithRepliesSerializer(many=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'profile', 'wishlist', 'orders', 'reviews', 'contacts', 'profile_picture','is_admin']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure email is from CustomUser, not UserProfile
        representation['email'] = instance.email
        return representation
    


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']


from rest_framework import serializers
from .models import CustomUser

class ProfilePictureUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['profile_picture']



# ========== Full User Profile Serializer ==========
# ========== Full User Profile Serializer ==========
# ========== Full User Profile Serializer ==========
# ========== Full User Profile Serializer ==========


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']

class LastOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'total_price', 'created_at', 'is_paid']
        
class CustomUserFullSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()
    last_order = serializers.SerializerMethodField()
    contact_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    wishlist_count = serializers.SerializerMethodField()

    profile = UserProfileInfoSerializer(source='userprofile', read_only=True)
    wishlist = WishlistItemSerializer(source='wishlists', many=True, read_only=True)
    orders = OrderSummarySerializer(source='order_set', many=True, read_only=True)
    reviews = UserReviewSerializer(source='review_set', many=True, read_only=True)
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'phone_number', 'date_of_birth',
            'profile_picture', 'is_active', 'is_admin',
            'orders_count', 'last_order',
            'contact_count', 'reviews_count', 'wishlist_count',
            'profile', 'wishlist', 'orders', 'reviews', 'contacts'
        ]

    def get_orders_count(self, obj):
        return Order.objects.filter(user=obj).count()

    def get_last_order(self, obj):
        order = Order.objects.filter(user=obj).order_by('-created_at').first()
        return LastOrderSerializer(order).data if order else None

    def get_contact_count(self, obj):
        return Contact.objects.filter(user=obj).count()

    def get_reviews_count(self, obj):
        return Review.objects.filter(user=obj).count()

    def get_wishlist_count(self, obj):
        return Wishlist.objects.filter(user=obj).count()

    def get_contacts(self, obj):
        contacts = Contact.objects.filter(user=obj).order_by('-created_at')[:5]
        return [
            {
                'id': contact.id,
                'subject': contact.subject,
                'message': contact.message,
                'created_at': contact.created_at
            } for contact in contacts
        ]


class CustomUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'phone_number', 'date_of_birth', 'is_admin']

    def create(self, validated_data):
        return CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number'),
            date_of_birth=validated_data.get('date_of_birth'),
            is_admin=validated_data.get('is_admin', False),
        )




from rest_framework import serializers
from .models import CustomUser, UserProfile

class UserProfileSerializer_2(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']

class UserSerializer_2(serializers.ModelSerializer):
    userprofile = UserProfileSerializer()
    
    class Meta:
        model = CustomUser
        fields = ['profile_picture', 'email', 'userprofile']

    def update(self, instance, validated_data):
        # تحديث بيانات CustomUser
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # تحديث بيانات UserProfile
        userprofile_data = validated_data.get('userprofile')
        if userprofile_data:
            userprofile = instance.userprofile
            userprofile.first_name = userprofile_data.get('first_name', userprofile.first_name)
            userprofile.last_name = userprofile_data.get('last_name', userprofile.last_name)
            userprofile.phone = userprofile_data.get('phone', userprofile.phone)
            userprofile.address = userprofile_data.get('address', userprofile.address)
            userprofile.save()

        return instance



from rest_framework import serializers
from .models import CustomUser, UserProfile
from backend_api.models import Contact, Order, Wishlist, Review, AdminReply, CartItem,Product

# سيريلزر للمنتج مع الصورة والسعر
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

# العناصر داخل الطلب
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductImageSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'added_at']

# الطلب مع العناصر
class UserOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'address', 'total_price', 'created_at', 'is_paid', 'items']

class UserWishlistSerializer(serializers.ModelSerializer):
    product = ProductImageSerializer()

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'added_at']

class UserReviewSerializer(serializers.ModelSerializer):
    product = ProductImageSerializer()

    class Meta:
        model = Review
        fields = ['id', 'product', 'rating', 'comment', 'created_at']

class UserAdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminReply
        fields = ['id', 'reply', 'replied_at', 'replied_by']

class UserProfileDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address']

class UserAccountSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone_number', 'date_of_birth', 'profile_picture', 'is_admin']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

class CompleteUserDataSerializer(serializers.Serializer):
    user = UserAccountSerializer()
    profile = UserProfileDataSerializer()
    orders = UserOrderSerializer(many=True)
    wishlists = UserWishlistSerializer(many=True)
    reviews = UserReviewSerializer(many=True)
    admin_replies = UserAdminReplySerializer(many=True)
