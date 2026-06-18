"""
Fast model training - skips grid search, trains directly with good defaults.
Run this instead of train_improved_model.py for quick setup.
"""
import numpy as np
import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

os.makedirs('models', exist_ok=True)
os.makedirs('plots', exist_ok=True)

print("=" * 55)
print("FAST MODEL TRAINING")
print("=" * 55)

# ── 1. Generate dataset ──────────────────────────────────────
print("\n[1/4] Generating dataset...")

np.random.seed(42)
n = 5000

def make_samples(n_each):
    rows = []
    # NORMAL
    for _ in range(n_each):
        v = np.random.uniform(30, 36)
        c = np.random.uniform(7.5, 9.5)
        t = np.random.uniform(18, 32)
        irr = np.random.uniform(750, 1050)
        p = v * c * np.random.uniform(0.95, 1.05)
        rows.append([v, c, t, irr, p, 'NORMAL'])
    # PARTIAL_SHADING
    for _ in range(n_each):
        v = np.random.uniform(24, 29)
        c = np.random.uniform(3.5, 5.5)
        t = np.random.uniform(20, 30)
        irr = np.random.uniform(400, 650)
        p = v * c * np.random.uniform(0.85, 0.95)
        rows.append([v, c, t, irr, p, 'PARTIAL_SHADING'])
    # PANEL_DEGRADATION
    for _ in range(n_each):
        v = np.random.uniform(27, 32)
        c = np.random.uniform(6.0, 8.0)
        t = np.random.uniform(40, 52)
        irr = np.random.uniform(800, 980)
        p = v * c * np.random.uniform(0.70, 0.82)
        rows.append([v, c, t, irr, p, 'PANEL_DEGRADATION'])
    # INVERTER_FAULT
    for _ in range(n_each):
        v = np.random.uniform(16, 23)
        c = np.random.uniform(5.5, 7.5)
        t = np.random.uniform(38, 52)
        irr = np.random.uniform(780, 920)
        p = v * c * np.random.uniform(0.55, 0.72)
        rows.append([v, c, t, irr, p, 'INVERTER_FAULT'])
    # DUST_ACCUMULATION
    for _ in range(n_each):
        v = np.random.uniform(28, 33)
        c = np.random.uniform(6.8, 8.5)
        t = np.random.uniform(22, 34)
        irr = np.random.uniform(520, 720)
        p = v * c * np.random.uniform(0.78, 0.90)
        rows.append([v, c, t, irr, p, 'DUST_ACCUMULATION'])
    return rows

rows = make_samples(n // 5)
df = pd.DataFrame(rows, columns=['voltage','current','temperature','irradiance','power','fault_type'])
df.to_csv('data/improved_solar_data.csv', index=False)
print(f"  {len(df)} samples across 5 classes")

# ── 2. Feature engineering ───────────────────────────────────
print("[2/4] Engineering features...")
df['efficiency']             = df['power'] / (df['irradiance'] + 1e-6)
df['voltage_current_ratio']  = df['voltage'] / (df['current'] + 1e-6)
df['power_voltage_ratio']    = df['power'] / (df['voltage'] + 1e-6)
df['temperature_effect']     = df['temperature'] / (df['irradiance'] + 1e-6)
df['power_density']          = df['power'] / (df['voltage'] * df['current'] + 1e-6)

X = df.drop('fault_type', axis=1)
y = df['fault_type']

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)
print(f"  Train: {len(X_train)}  Test: {len(X_test)}")

# ── 3. Train ─────────────────────────────────────────────────
print("[3/4] Training Random Forest (this takes ~10 seconds)...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_s, y_train)

y_pred = model.predict(X_test_s)
acc = accuracy_score(y_test, y_pred)
print(f"  Accuracy: {acc:.4f}")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── 4. Save ──────────────────────────────────────────────────
print("[4/4] Saving model files...")
joblib.dump(model,  'models/solar_fault_model_v2.pkl')
joblib.dump(scaler, 'models/preprocessors_scaler_v2.pkl')
joblib.dump(le,     'models/preprocessors_label_encoder_v2.pkl')

print("\n" + "=" * 55)
print("DONE — model files saved to models/")
print("  models/solar_fault_model_v2.pkl")
print("  models/preprocessors_scaler_v2.pkl")
print("  models/preprocessors_label_encoder_v2.pkl")
print("\nNow run:  python api/app.py")
print("=" * 55)
