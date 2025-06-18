from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from .models import Notification

@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            message=f"New order created: {instance.id}",
            order=instance
        )
