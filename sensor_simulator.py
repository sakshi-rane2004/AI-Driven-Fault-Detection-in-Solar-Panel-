"""
IoT Sensor Data Simulator
Simulates real solar panel sensors sending data to the backend API
"""

import requests
import time
import random
from datetime import datetime

# Configuration
API_URL = "http://localhost:8085/api/v1/sensor-data"
PANEL_IDS = ["P001", "P002", "P003", "P004", "P005"]
INTERVAL_SECONDS = 10  # Send data every 10 seconds

def generate_normal_data():
    """Generate normal operating sensor data"""
    return {
        "voltage": round(random.uniform(30.0, 35.0), 2),
        "current": round(random.uniform(7.5, 9.0), 2),
        "temperature": round(random.uniform(20.0, 30.0), 2),
        "irradiance": round(random.uniform(800.0, 1000.0), 2),
        "power": round(random.uniform(250.0, 300.0), 2)
    }

def generate_faulty_data(fault_type):
    """Generate faulty sensor data"""
    if fault_type == "INVERTER_FAULT":
        return {
            "voltage": round(random.uniform(18.0, 22.0), 2),
            "current": round(random.uniform(6.0, 7.5), 2),
            "temperature": round(random.uniform(40.0, 50.0), 2),
            "irradiance": round(random.uniform(800.0, 900.0), 2),
            "power": round(random.uniform(120.0, 160.0), 2)
        }
    elif fault_type == "PARTIAL_SHADING":
        return {
            "voltage": round(random.uniform(25.0, 28.0), 2),
            "current": round(random.uniform(4.0, 5.5), 2),
            "temperature": round(random.uniform(22.0, 28.0), 2),
            "irradiance": round(random.uniform(500.0, 650.0), 2),
            "power": round(random.uniform(110.0, 150.0), 2)
        }
    elif fault_type == "PANEL_DEGRADATION":
        return {
            "voltage": round(random.uniform(28.0, 32.0), 2),
            "current": round(random.uniform(6.5, 8.0), 2),
            "temperature": round(random.uniform(42.0, 48.0), 2),
            "irradiance": round(random.uniform(850.0, 950.0), 2),
            "power": round(random.uniform(180.0, 220.0), 2)
        }
    else:  # DUST_ACCUMULATION
        return {
            "voltage": round(random.uniform(29.0, 33.0), 2),
            "current": round(random.uniform(7.0, 8.5), 2),
            "temperature": round(random.uniform(24.0, 32.0), 2),
            "irradiance": round(random.uniform(550.0, 700.0), 2),
            "power": round(random.uniform(200.0, 240.0), 2)
        }

def send_sensor_data(panel_id, sensor_data):
    """Send sensor data to the API"""
    payload = {
        "panelId": panel_id,
        **sensor_data,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ [{panel_id}] Data sent successfully")
            print(f"   Prediction: {result.get('predictedFault')} - {result.get('severity')}")
            if result.get('predictedFault') != 'NORMAL':
                print(f"   ⚠️  ALERT GENERATED!")
        else:
            print(f"❌ [{panel_id}] Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ [{panel_id}] Connection error: {str(e)}")

def simulate_sensors():
    """Main simulation loop"""
    print("=" * 60)
    print("IoT Sensor Data Simulator Started")
    print("=" * 60)
    print(f"API Endpoint: {API_URL}")
    print(f"Monitoring Panels: {', '.join(PANEL_IDS)}")
    print(f"Data Interval: {INTERVAL_SECONDS} seconds")
    print("=" * 60)
    print("\nPress Ctrl+C to stop\n")
    
    iteration = 0
    
    try:
        while True:
            iteration += 1
            print(f"\n--- Iteration {iteration} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---")
            
            for panel_id in PANEL_IDS:
                # 80% chance of normal data, 20% chance of fault
                if random.random() < 0.8:
                    sensor_data = generate_normal_data()
                else:
                    fault_type = random.choice([
                        "INVERTER_FAULT",
                        "PARTIAL_SHADING",
                        "PANEL_DEGRADATION",
                        "DUST_ACCUMULATION"
                    ])
                    sensor_data = generate_faulty_data(fault_type)
                    print(f"🔧 [{panel_id}] Simulating {fault_type}")
                
                send_sensor_data(panel_id, sensor_data)
                time.sleep(0.5)  # Small delay between panels
            
            print(f"\nWaiting {INTERVAL_SECONDS} seconds before next iteration...")
            time.sleep(INTERVAL_SECONDS)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("Sensor Simulator Stopped")
        print("=" * 60)

if __name__ == "__main__":
    simulate_sensors()
