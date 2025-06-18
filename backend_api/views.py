from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Sum
from decimal import Decimal

from rest_framework import status, permissions, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

from .models import *
from .serializers import *
from .permissions import IsSuperUser
from .serializers import OrderSerializer

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
import json

from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
import json

class Product_2ViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductserializersAdmin

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            # Handle clothing categories - extract from the data
            clothing_categories_ids = []
            
            # Check if clothing_categories_ids is sent as multiple values
            if 'clothing_categories_ids' in data:
                if isinstance(data.getlist('clothing_categories_ids'), list):
                    clothing_categories_ids = [int(x) for x in data.getlist('clothing_categories_ids') if x]
                elif data.get('clothing_categories_ids'):
                    clothing_categories_ids = [int(data.get('clothing_categories_ids'))]
            
            # Remove from data as it's not a direct field
            if 'clothing_categories_ids' in data:
                del data['clothing_categories_ids']
            
            # Handle JSON data if sent (alternative approach)
            if 'data' in request.data:
                try:
                    json_data = json.loads(request.data['data'])
                    for key, value in json_data.items():
                        if key != 'clothing_categories_ids':
                            data[key] = value
                        else:
                            clothing_categories_ids = value or []
                except json.JSONDecodeError:
                    pass
            
            # Create the product instance
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                # Save the product
                product = serializer.save()
                
                # Add clothing categories (many-to-many relationship)
                if clothing_categories_ids:
                    clothing_categories = CategoryProduct.objects.filter(id__in=clothing_categories_ids)
                    product.Clothing_Categories.set(clothing_categories)
            
            # Return the created product data
            response_serializer = Productserializers(product)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            data = request.data.copy()
            
            # Handle clothing categories
            clothing_categories_ids = []
            if 'clothing_categories_ids' in data:
                if isinstance(data.getlist('clothing_categories_ids'), list):
                    clothing_categories_ids = [int(x) for x in data.getlist('clothing_categories_ids') if x]
                elif data.get('clothing_categories_ids'):
                    clothing_categories_ids = [int(data.get('clothing_categories_ids'))]
                del data['clothing_categories_ids']
            
            # Handle JSON data if sent
            if 'data' in request.data:
                try:
                    json_data = json.loads(request.data['data'])
                    for key, value in json_data.items():
                        if key != 'clothing_categories_ids':
                            data[key] = value
                        else:
                            clothing_categories_ids = value or []
                except json.JSONDecodeError:
                    pass
            
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            with transaction.atomic():
                product = serializer.save()
                
                # Update clothing categories
                if clothing_categories_ids or 'clothing_categories_ids' in request.data:
                    clothing_categories = CategoryProduct.objects.filter(id__in=clothing_categories_ids)
                    product.Clothing_Categories.set(clothing_categories)
            
            response_serializer = Productserializers(product)
            return Response(response_serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(stock__gt=0)
    serializer_class = Productserializers
    def get_queryset(self):
        queryset = Product.objects.filter(stock__gt=0)
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(Category__id=category_id)
        return queryset


class ColorProductViewSet(viewsets.ModelViewSet):
    queryset = ColorProduct.objects.all()
    serializer_class = ColorProductserializers

class SizeProductViewSet(viewsets.ModelViewSet):
    queryset = SizeProduct.objects.all()
    serializer_class = SizeProductserializers

class CategoryProductViewSet(viewsets.ModelViewSet):
    queryset = CategoryProduct.objects.all()
    serializer_class = CategoryProductserializers

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = Categoryserializers


@api_view(['GET'])
def product_detail_api(request, pk):
    product = get_object_or_404(Product, pk=pk)
    serializer = Productserializers(product)
    return Response(serializer.data)

@api_view(['GET'])
def get_colors(request):
    colors = ColorProduct.objects.all()
    serializer = ColorProductserializers(colors, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_sizes(request):
    sizes = SizeProduct.objects.all()
    serializer = SizeProductserializers(sizes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_category_products(request):
    category_products = CategoryProduct.objects.all()
    serializer = CategoryProductserializers(category_products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = Categoryserializers(categories, many=True)
    return Response(serializer.data)



class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "تمت الإضافة إلى السلة بنجاح"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            items = cart.items.all()  # related_name="items"
            serializer = CartItemSerializer(items, many=True)
            return Response(serializer.data)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart not found."}, status=404)





class AddToWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToWishlistSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "تمت الإضافة إلى المفضلة بنجاح"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WishlistProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist_items = Wishlist.objects.filter(user=request.user)
        product_ids = wishlist_items.values_list('product_id', flat=True)
        return Response({"wishlist": list(product_ids)})






class SuperUserOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def get(self, request):
        return Response({"message": "أهلاً بك أيها السوبر يوزر!"})


class ProductUpdateAPIView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = Productserializers
    parser_classes = [MultiPartParser, FormParser]


class SubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # فقط للمستخدمين المسجلين

    def post(self, request):
        email = request.data.get('email')

        if Subscribe.objects.filter(email=email).exists():
            return Response({'detail': 'You are already subscribed to this email.❌'}, status=status.HTTP_400_BAD_REQUEST)

        subscription = Subscribe.objects.create(user=request.user, email=email)
        serializer = SubscribeSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        subscriptions = Subscribe.objects.all()
        serializer = SubscribeSerializer(subscriptions, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        subscription = get_object_or_404(Subscribe, pk=pk)
        subscription.delete()  
        return Response({'detail': 'Subscription deleted successfully ✅'}, status=status.HTTP_204_NO_CONTENT)


class ContactAPIView(APIView):
    permission_classes = [IsAuthenticated]  # اختياري: اجعلها مطلوبة فقط للمستخدمين المسجلين

    def get(self, request):
        contact_settings = Contact.objects.last()
        serializer = ContactSettingsSerializer(contact_settings)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id  # أضف المستخدم الحالي إلى البيانات

        serializer = ContactSettingsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Message saved successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ContactMessageAPIView(APIView):
    def get(self, request):
        search = request.GET.get("search", "")
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 5))

        # فلترة عند وجود كلمة بحث
        queryset = Contact.objects.all().order_by("-created_at")
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search) |
                Q(message__icontains=search)
            )

        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        data = ContactSettingsSerializer(queryset[start:end], many=True).data

        return Response({
            "results": data,
            "count": total,
            "page": page,
            "page_size": page_size
        })

    def delete(self, request, pk):
        try:
            contact = Contact.objects.get(id=pk)
            contact.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except ContactSettingsSerializer.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)



class DiscountListAPIView(generics.ListAPIView):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer




@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    coupon_code = request.data.get('coupon', '').strip()

    # يمكنك إزالة هذا الشرط التجريبي DISCOUNT10 لأنه صار غير ضروري بعد التحقق من الموديل مباشرة
    is_valid, result = validate_coupon_helper(coupon_code, request.user if request.user.is_authenticated else None)
    if is_valid:
        coupon = result
        return Response({"valid": True, "discount_percent": coupon.discount_percent})
    else:
        return Response({"valid": False, "error": result}, status=400)



def validate_coupon_helper(coupon_code, user):
    if not coupon_code or coupon_code.strip() == "":
        return False, "لم يتم إدخال كود الكوبون."

    coupon = Coupon.objects.filter(code__iexact=coupon_code).first()
    if not coupon:
        return False, "الكوبون غير موجود."
    if not coupon.is_active:
        return False, "الكوبون غير مفعل."

    now = timezone.now()
    if coupon.start_date and coupon.end_date:
        if not (coupon.start_date <= now <= coupon.end_date):
            return False, "الكوبون منتهي الصلاحية."

    if user and CouponUsage.objects.filter(user=user, coupon=coupon).exists():
        return False, "لقد استخدمت هذا الكوبون من قبل."

    return True, coupon

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            user = request.user

            first_name  = request.data.get("first_name")
            last_name   = request.data.get("last_name")
            email       = request.data.get("email")
            phone       = request.data.get("phone")
            address     = request.data.get("address")
            coupon_code = request.data.get("coupon", "").strip()

            required_fields = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": phone,
                "address": address,
            }

            for field, value in required_fields.items():
                if not value or str(value).strip() == "":
                    return Response({"error": f"الحقل {field} مطلوب."}, status=400)

            cart_items = CartItem.objects.filter(cart__user=user)
            if not cart_items.exists():
                return Response({"error": "السلة فارغة."}, status=400)

            total = sum(item.product.price * item.quantity for item in cart_items)
            discount = Decimal('0')
            delivery_fee = Decimal('0')

            # خصم من جدول Discount
            discount_obj = Discount.objects.first()
            if discount_obj:
                if discount_obj.discount_percent:
                    extra_discount_percent = Decimal(str(discount_obj.discount_percent))
                    discount += total * (extra_discount_percent / Decimal('100'))
                if discount_obj.delivery_fee:
                    delivery_fee = Decimal(str(discount_obj.delivery_fee))

            # خصم من الكوبون إذا وُجد
            if coupon_code:
                is_valid, result = validate_coupon_helper(coupon_code, user)
                if not is_valid:
                    return Response({"error": result}, status=400)
                coupon = result
                coupon_discount_percent = Decimal(str(coupon.discount_percent))
                discount += total * (coupon_discount_percent / Decimal('100'))
                CouponUsage.objects.create(user=user, coupon=coupon)

            final_total = total - discount + delivery_fee

            if final_total <= 0:
                return Response({"error": "السعر النهائي غير صالح."}, status=400)

            # إنشاء الطلب
            order = Order.objects.create(
                user=user,
                first_name=first_name.strip(),
                last_name=last_name.strip(),
                email=email.strip(),
                phone=phone.strip(),
                total_price=final_total,
                address=address.strip(),
                is_paid=False,
            )

            for item in cart_items:
                if item.product.stock < item.quantity:
                    return Response({
                        "error": f"الكمية غير كافية للمنتج {item.product.title}",
                        "available_stock": item.product.stock,
                        "requested_quantity": item.quantity
                    }, status=400)

                item.product.stock -= item.quantity
                item.product.save()

                item.cart = None
                item.order = order
                item.save()

            serializer = OrderSerializer(order)
            return Response({
                "order": serializer.data,
                "total_before_discount": str(total),
                "total_discount": str(discount),
                "delivery_fee": str(delivery_fee),
                "final_total": str(final_total)
            }, status=201)

        except Exception as e:
            return Response({"error": "فشل في إنشاء الطلب", "details": str(e)}, status=500)


class DeleteOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, order_id):
        try:
            user = request.user
            try:
                order = Order.objects.get(id=order_id, user=user)
            except Order.DoesNotExist:
                return Response({"error": "الطلب غير موجود أو لا يخصك."}, status=status.HTTP_404_NOT_FOUND)

            if order.is_paid:
                return Response({"error": "لا يمكن حذف طلب تم دفعه."}, status=status.HTTP_400_BAD_REQUEST)

            # استرجاع الكميات للمنتجات
            items = order.items.all()  # تأكد أن لديك علاقة اسمها items بين Order وCartItem أو OrderItem
            for item in items:
                product = item.product
                product.stock += item.quantity
                product.save()

            # حذف العناصر المرتبطة أولاً (حسب إعداداتك)
            items.delete()

            # حذف الطلب
            order.delete()

            return Response({"message": "تم حذف الطلب بنجاح وتم استرجاع الكميات."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "حدث خطأ أثناء حذف الطلب", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateOrderPaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]  # يمكن تخصيصه فقط للمشرفين لاحقًا

    def patch(self, request, order_id):
        try:
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                return Response({"error": "الطلب غير موجود."}, status=status.HTTP_404_NOT_FOUND)

            # نأخذ الحالة الجديدة من البيانات المُرسلة
            new_status = request.data.get("is_paid")

            if new_status is None:
                return Response({"error": "يرجى إرسال القيمة الجديدة لحالة الدفع (is_paid)."}, status=400)

            order.is_paid = bool(new_status)
            order.save()

            return Response({"message": f"تم تحديث حالة الدفع للطلب إلى {order.is_paid} بنجاح."}, status=200)

        except Exception as e:
            return Response({"error": "حدث خطأ أثناء التحديث", "details": str(e)}, status=500)

class WishlistDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, product_id=product_id)
            wishlist_item.delete()
            return Response({'message': 'Item removed from wishlist.'}, status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Item not found in wishlist.'}, status=status.HTTP_404_NOT_FOUND)




class UpdateCartItemQuantityView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, product_id):
        quantity = request.data.get('quantity')

        if quantity is None:
            return Response({'error': 'Quantity is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= int(quantity) <= 10):
            return Response({'error': 'Quantity must be between 1 and 10.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.quantity = int(quantity)
            cart_item.save()
            return Response({'message': 'Quantity updated successfully.'}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        except CartItem.DoesNotExist:
            return Response({'error': 'Product not in cart.'}, status=status.HTTP_404_NOT_FOUND)



class DeleteCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.delete()
            return Response({'message': 'Item removed from cart.'}, status=status.HTTP_204_NO_CONTENT)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not in cart.'}, status=status.HTTP_404_NOT_FOUND)

class AddReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "تم إضافة التقييم بنجاح."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        user = request.user

        # تحقق هل المستخدم قيّم المنتج مسبقًا
        if Review.objects.filter(user=user, product_id=product_id).exists():
            return Response({'detail': 'لقد قمت بتقييم هذا المنتج مسبقًا.'}, status=status.HTTP_400_BAD_REQUEST)

        # إذا لم يكن قد قيّمه، احفظ التقييم
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, product_id=product_id)
            return Response({'detail': 'تم إضافة التقييم بنجاح.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class HasUserReviewedProduct(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        has_reviewed = Review.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({'has_reviewed': has_reviewed})


class HasUserReviewedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        has_reviewed = SiteExperienceReview.objects.filter(user=user).exists()
        return Response({"has_reviewed": has_reviewed})


class SubmitSiteReview(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if SiteExperienceReview.objects.filter(user=request.user).exists():
            return Response({"message": "لقد قمت بالتقييم مسبقًا."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SiteExperienceReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "شكرًا على تقييمك!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# views.py
class SiteExperienceReviewCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SiteExperienceReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message': 'Review submitted successfully'}, status=201)
        return Response(serializer.errors, status=400)
    


class SiteExperienceReviewListAPIView(APIView):
    def get(self, request):
        reviews = SiteExperienceReview.objects.all()
        serializer = SiteExperienceReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ReviewListAPIView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_items_count(request):
    try:
        cart = Cart.objects.get(user=request.user)
        total_items = cart.get_total_items()
    except Cart.DoesNotExist:
        total_items = 0
    
    return Response({'cart_items_count': total_items})



class CheckProductInCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        in_cart = CartItem.objects.filter(cart__user=request.user, product_id=product_id).exists()
        return Response({'in_cart': in_cart}, status=status.HTTP_200_OK)




@api_view(['GET'])
def best_selling_products(request):
    # نجمع عدد المبيعات لكل منتج (فقط من cartitems المرتبطة بـ order فعلي)
    top_products = Product.objects.annotate(
        total_sold=Sum('cartitem__quantity', filter=~models.Q(cartitem__order=None))
    ).filter(total_sold__gt=0).order_by('-total_sold')[:10]

    serializer = Productserializers(top_products, many=True)
    return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactMessageSerializer

class AdminReplyViewSet(viewsets.ModelViewSet):
    serializer_class = AdminReplySerializer

    def get_queryset(self):
        user = self.request.user
        # إرجاع الردود على الرسائل التي أرسلها هذا المستخدم فقط
        return AdminReply.objects.filter(contact_message__user=user)

@api_view(['GET'])
def get_Reply(request):
    
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)

    user =  request.user
    replies = AdminReply.objects.filter(contact_message__user=user)
    serializer = AdminReplySerializer(replies, many=True)
    return Response(serializer.data)


class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer




from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Discount, Coupon
from .serializers import DiscountSerializer_2, CouponSerializer
from django.db.models import ExpressionWrapper, DecimalField
class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer_2
    permission_classes = [IsAuthenticatedOrReadOnly]

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
from django.db.models import Sum, Count, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Coupon, Discount, Order, CouponUsage
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Coupon, CouponUsage, Order
from .serializers import CouponSerializer
from django.db.models import Count, Sum, F

class CouponStatsAPIView(APIView):
    def get(self, request):
        now = timezone.now()
        coupons = Coupon.objects.all()
        
        # أكثر كوبونات استخدامًا
        most_used = CouponUsage.objects.values('coupon__code').annotate(
            total_used=Count('id')
        ).order_by('-total_used')[:5]

        # الكوبونات المفعّلة حاليًا
        active_discounts = Coupon.objects.filter(is_active=True, start_date__lte=now, end_date__gte=now)

        # إجمالي عدد مرات الاستخدام
        total_usage = CouponUsage.objects.count()

        # إجمالي التوفير: فرق السعر الذي تم توفيره باستخدام الكوبونات
        total_savings = Order.objects.filter(coupon__isnull=False).annotate(
    saved=ExpressionWrapper(
        F('coupon__discount_percent') * F('total_price') / 100,
        output_field=DecimalField(max_digits=10, decimal_places=2)
    )
).aggregate(total_saved=Sum('saved'))['total_saved'] or 0

        # الكوبونات التي ستنتهي قريبًا (مثلاً خلال 7 أيام)
        expiring_soon = Coupon.objects.filter(
            is_active=True, end_date__gte=now, end_date__lte=now + timezone.timedelta(days=7)
        )

        return Response({
            "most_used": list(most_used),
            "active_discounts": CouponSerializer(active_discounts, many=True).data,
            "total_usage": total_usage,
            "total_savings": round(total_savings, 2),
            "expiring_soon": CouponSerializer(expiring_soon, many=True).data,
            "all_coupons": CouponSerializer(coupons, many=True).data,
        })



from rest_framework import viewsets
from .models import Notification
from .serializers import NotificationSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['post'])
    def clear_unread(self, request):
        # نحذف فقط الإشعارات التي لم تُقرأ
        unread_notifications = self.queryset.filter(is_read=False)
        count = unread_notifications.count()
        unread_notifications.delete()
        return Response({'message': f'{count} unread notifications deleted.'}, status=status.HTTP_200_OK)



from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Notification

@api_view(['POST'])
def mark_all_notifications_read(request):
    Notification.objects.filter(is_read=False).update(is_read=True)
    return Response({'status': 'all notifications marked as read'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_all_notifications(request):
    # احذف كل الإشعارات (لكن لا تلمس الطلبات)
    Notification.objects.all().delete()
    return Response({"detail": "Notifications deleted."})