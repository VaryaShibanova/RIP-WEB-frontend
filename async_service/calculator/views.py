import random
import time
import requests
import threading
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

@csrf_exempt
def calculate_years(request):
    """
    Запуск асинхронного расчета calculated_year для ВСЕХ TreeItem заявки
    Вызывается когда модератор завершает заявку
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    data = request.json() if hasattr(request, 'json') else None
    if not data:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Валидация
    required_fields = ['tree_id', 'tree_items']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f'Missing field: {field}'}, status=400)
    
    # Запускаем асинхронные расчеты для каждого TreeItem
    thread = threading.Thread(
        target=process_all_calculations_async,
        args=(data['tree_id'], data['tree_items'])
    )
    thread.daemon = True
    thread.start()
    
    return JsonResponse({
        'message': 'Async calculations started for all tree items',
        'tree_id': data['tree_id'],
        'total_items': len(data['tree_items']),
        'status': 'processing'
    })

def process_all_calculations_async(tree_id, tree_items):
    """
    Асинхронная обработка ВСЕХ TreeItem заявки
    """
    results = []
    
    # Для каждого TreeItem запускаем расчет
    for item in tree_items:
        # ЗАДЕРЖКА 5-10 секунд для КАЖДОГО элемента
        delay_seconds = random.randint(5, 10)
        time.sleep(delay_seconds)
        
        # СЛУЧАЙНЫЙ РЕЗУЛЬТАТ
        success = random.choice([True, False, True])
        
        if success:
            calculated_year = calculate_year_for_anomaly(
                item['total_rings'],
                item['anomalous_rings'],
                item['anomaly_year']
            )
            status = 'completed'
        else:
            calculated_year = 0
            status = 'failed'
        
        results.append({
            'tree_item_id': item['tree_item_id'],
            'calculated_year': calculated_year,
            'status': status
        })
        
        # Отправляем результат для КАЖДОГО элемента отдельно
        send_callback_to_go_service(tree_id, item['tree_item_id'], calculated_year, status)
    
    # Когда ВСЕ расчеты завершены - отправляем финальный callback
    send_final_callback(tree_id, results)

def calculate_year_for_anomaly(total_rings, anomalous_rings, anomaly_year):
    """Формула расчета calculated_year"""
    if anomalous_rings and anomalous_rings.strip():
        try:
            rings = [int(r.strip()) for r in anomalous_rings.split(',') if r.strip()]
            max_ring = max(rings) if rings else 0
        except:
            max_ring = 0
    else:
        max_ring = 0
    
    return anomaly_year + (total_rings - max_ring)

def send_callback_to_go_service(tree_id, tree_item_id, calculated_year, status):
    """Callback для каждого TreeItem"""
    callback_url = f"{settings.GO_SERVICE_URL}/api/async/result"
    
    payload = {
        'tree_id': tree_id,
        'tree_item_id': tree_item_id,
        'calculated_year': calculated_year,
        'status': status
    }
    
    headers = {
        'Authorization': f'Bearer {settings.CALLBACK_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        requests.post(callback_url, json=payload, headers=headers, timeout=10)
        print(f"Callback sent for tree_item {tree_item_id}")
    except Exception as e:
        print(f"Callback error: {e}")

def send_final_callback(tree_id, results):
    """Финальный callback когда все расчеты завершены"""
    callback_url = f"{settings.GO_SERVICE_URL}/api/async/final-result"
    
    payload = {
        'tree_id': tree_id,
        'message': 'All calculations completed',
        'results': results,
        'final_status': 'completed'
    }
    
    headers = {
        'Authorization': f'Bearer {settings.CALLBACK_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        requests.post(callback_url, json=payload, headers=headers, timeout=10)
        print(f"Final callback sent for tree {tree_id}")
    except Exception as e:
        print(f"Final callback error: {e}")