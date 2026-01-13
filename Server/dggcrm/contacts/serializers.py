from rest_framework import serializers

from .models import Contact, Tag, TagAssignments, ContactActivity


class ContactSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "modified_at",
        ]

    def get_tags(self, obj):
        """Get tags for this person"""
        assigned_tags = TagAssignments.objects.filter(contact_id=obj).select_related('tag')
        return [
            {
                'id': at.tag.id,
                'name': at.tag.name,
                'color': at.tag.color
            }
            for at in assigned_tags
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'modified_at']


class TagAssignmentSerializer(serializers.ModelSerializer):
    contact_id = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(),
        source="contact",
    )
    tag_name = serializers.SlugRelatedField(
        queryset=Tag.objects.all(),
        slug_field="name",
        source="tag",
    )

    class Meta:
        model = TagAssignments
        fields = [
            "id",
            "contact_id",
            "tag_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class ContactActivitySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(
        source="get_activity_type_display",
        read_only=True,
    )

    class Meta:
        model = ContactActivity
        fields = [
            "id",
            "contact",
            "activity_type",
            "activity_type_display",
            "data",
            "activity_date",
        ]
        read_only_fields = [
            "id",
            "activity_date",
        ]