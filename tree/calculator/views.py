import random
import time
import requests
import threading
import json
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
    
    # ЛОГИРОВАНИЕ ДЛЯ ДЕБАГА
    print("=== INCOMING REQUEST TO DJANGO ===")
    print("Headers:", dict(request.headers))
    print("Raw body:", request.body)
    
    try:
        # ПРАВИЛЬНЫЙ ПАРСИНГ JSON
        data = json.loads(request.body)
        print("Parsed JSON data:", data)
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        return JsonResponse({'error': 'Invalid JSON: ' + str(e)}, status=400)
    
    # Валидация
    required_fields = ['tree_id', 'tree_items']
    for field in required_fields:
        if field not in data:
            error_msg = f'Missing field: {field}'
            print("Validation error:", error_msg)
            return JsonResponse({'error': error_msg}, status=400)
    
    # Дополнительная валидация tree_items
    if not isinstance(data['tree_items'], list):
        return JsonResponse({'error': 'tree_items must be a list'}, status=400)
    
    for i, item in enumerate(data['tree_items']):
        item_fields = ['tree_item_id', 'anomaly_id', 'total_rings', 'anomalous_rings', 'anomaly_year']
        for field in item_fields:
            if field not in item:
                return JsonResponse({'error': f'Missing field {field} in tree_items[{i}]'}, status=400)
    
    print(f"Starting async calculations for tree {data['tree_id']} with {len(data['tree_items'])} items")
    
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
    print(f"Processing {len(tree_items)} items for tree {tree_id}")
    results = []
    
    # Для каждого TreeItem запускаем расчет
    for i, item in enumerate(tree_items):
        print(f"Processing item {i+1}/{len(tree_items)}: tree_item_id={item['tree_item_id']}")
        
        # ЗАДЕРЖКА 5-10 секунд для КАЖДОГО элемента
        delay_seconds = random.randint(5, 10)
        print(f"Waiting {delay_seconds} seconds for item {item['tree_item_id']}")
        time.sleep(delay_seconds)
        
        # СЛУЧАЙНЫЙ РЕЗУЛЬТАТ
        success = random.choice([True, False, True])
        print(f"Calculation {'SUCCESS' if success else 'FAILED'} for item {item['tree_item_id']}")
        
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
    print(f"All calculations completed for tree {tree_id}")
    send_final_callback(tree_id, results)

def calculate_year_for_anomaly(total_rings, anomalous_rings, anomaly_year):
    """Формула расчета calculated_year"""
    print(f"Calculating: total_rings={total_rings}, anomalous_rings='{anomalous_rings}', anomaly_year={anomaly_year}")
    
    if anomalous_rings and anomalous_rings.strip():
        try:
            rings = [int(r.strip()) for r in anomalous_rings.split(',') if r.strip()]
            max_ring = max(rings) if rings else 0
            print(f"Parsed rings: {rings}, max_ring: {max_ring}")
        except Exception as e:
            print(f"Error parsing rings: {e}")
            max_ring = 0
    else:
        max_ring = 0
        print("No anomalous rings or empty string")
    
    calculated_year = anomaly_year + (total_rings - max_ring)
    print(f"Calculated year: {calculated_year}")
    
    return calculated_year

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
        'Authorization': 'Bearer abc12345',  # Простой токен для псевдо-авторизации
        'Content-Type': 'application/json'
    }
    
    print(f"Sending callback to Go: {payload}")
    
    try:
        response = requests.post(callback_url, json=payload, headers=headers, timeout=10)
        print(f"Callback response: {response.status_code}")
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
        'Authorization': 'Bearer abc12345',  # Простой токен для псевдо-авторизации
        'Content-Type': 'application/json'
    }
    
    print(f"Sending final callback for tree {tree_id}")
    
    try:
        response = requests.post(callback_url, json=payload, headers=headers, timeout=10)
        print(f"Final callback response: {response.status_code}")
    except Exception as e:
        print(f"Final callback error: {e}")