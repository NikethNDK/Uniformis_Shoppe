from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile,Address

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id','first_name', 'last_name', 'username','email','phone_number','password', 'is_active','date_of_birth', 'profile_picture')
        extra_kwargs = {'password':{'write_only':True},
                        'date_of_birth': {'required': False}
                        }
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def get_profile_picture(self, obj):
        try:
            # Assuming you have a OneToOne relationship between User and UserProfile
            if hasattr(obj, 'userprofile') and obj.userprofile.profile_picture:
                return obj.userprofile.profile_picture.url
        except:
            pass
        return None
    
    def update(self, instance, validated_data):
    
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.is_admin = validated_data.get('is_admin', instance.is_admin)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_superadmin = validated_data.get('is_superadmin', instance.is_superadmin)
        instance.date_of_birth = validated_data.get('date_of_birth',instance.date_of_birth)
       
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        print("User successfully updated")
        return instance

        


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'profile_picture']

    def update(self, instance, validated_data):
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance
    
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields= [
            'id', 'name', 'house_no', 'city', 'state', 'pin_code',
            'address_type', 'landmark', 'mobile_number', 'alternate_number'
        ]

    def validate_pin_code(self,value):
        if not value.isdigit() or len(value)!=6:
            raise serializers.ValidationError("Pincode must be 6 digits")
        return value
    
    def validate_mobile_number(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Mobile number must be 10 digits")
        return value
        
    def validate_alternate_number(self, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("Alternate number must be 10 digits")
        return value