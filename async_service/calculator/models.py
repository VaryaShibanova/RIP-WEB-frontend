from django.db import models

class CalculationTask(models.Model):
    TASK_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ]
    
    tree_id = models.IntegerField()
    tree_item_id = models.IntegerField()
    anomaly_id = models.IntegerField()
    total_rings = models.IntegerField()
    anomalous_rings = models.CharField(max_length=100)
    anomaly_year = models.IntegerField()
    
    calculated_year = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'calculation_tasks'