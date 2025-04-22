from django.db import models

class UploadedDocument(models.Model):
    user_name = models.CharField(max_length=128, default="Anonymous User")
    file_name = models.CharField(max_length=255)
    contract_type = models.CharField(max_length=100)
    encrypted_cleaned = models.TextField()
    summary = models.TextField(default="Hello")
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.contract_type}"
