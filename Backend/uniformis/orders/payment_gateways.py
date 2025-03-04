import razorpay
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_razorpay_client():
    logger.info(f"Initializing Razorpay client with key_id: {settings.RAZORPAY_KEY_ID}")
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

client = get_razorpay_client()

def create_razorpay_order(amount):
    try:
        data = {
            'amount': int(amount)*100,  # Convert to paise
            'currency': 'INR',
            'payment_capture': 1
        }
        logger.info(f"Creating Razorpay order with data: {data}")
        order = client.order.create(data=data)
        logger.info(f"Razorpay order created: {order}")
        return order
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        raise