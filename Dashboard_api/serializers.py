from Dashboard.models import EcommerceHomeSettings
from rest_framework import serializers

class EcommerceHomeSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceHomeSettings
        fields = '__all__'
from rest_framework import serializers
from Dashboard.models import EcommerceContactSettings

class EcommerceContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceContactSettings
        fields = '__all__'



from rest_framework import serializers

class MainDashboardSerializer(serializers.Serializer):
    revenue = serializers.DictField()
    orders = serializers.DictField()
    customers = serializers.DictField()
    stock_health = serializers.DictField()
    top_selling_products = serializers.ListField()
    top_customers = serializers.ListField()
    top_viewed_products = serializers.ListField()
    top_rated_products = serializers.ListField()
    coupons_summary = serializers.DictField()



# serializers.py
from backend_api.models import AdminReply, Contact, Subscribe, Review, SiteExperienceReview,Product
from django.contrib.auth import get_user_model

User = get_user_model()

# ✅ Serializer خاص بالمستخدم
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# ✅ Serializer خاص بالمنتج مع كافة التفاصيل
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# AdminReply
class AdminReplySerializer(serializers.ModelSerializer):
    replied_by_user = serializers.SerializerMethodField()

    class Meta:
        model = AdminReply
        fields = '__all__'

    def get_replied_by_user(self, obj):
        return obj.replied_by

# Contact مع الردود
class ContactSerializer(serializers.ModelSerializer):
    replies = AdminReplySerializer(many=True, read_only=True)
    user = UserSerializer()

    class Meta:
        model = Contact
        fields = '__all__'

class AddAdminReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminReply
        fields = ['contact_message', 'reply', 'replied_by']

# Subscribe
class SubscribeSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Subscribe
        fields = '__all__'

# ✅ Review مع عرض بيانات المنتج بالكامل + بيانات المستخدم
class ReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    user = UserSerializer()

    class Meta:
        model = Review
        fields = '__all__'

# SiteExperienceReview مع تفاصيل المستخدم
class SiteExperienceReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = SiteExperienceReview
        fields = '__all__'





from rest_framework import serializers
from Dashboard.models import  AdminProfile, EcommerceHomeSettings, EcommerceContactSettings
from backend_api.models import About

class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = '__all__'

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = '__all__'

class EcommerceHomeSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceHomeSettings
        fields = '__all__'

class EcommerceContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceContactSettings
        fields = '__all__'
