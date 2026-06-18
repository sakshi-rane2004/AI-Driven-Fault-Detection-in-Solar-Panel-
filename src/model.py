"""
Random Forest model for solar panel fault detection.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
from typing import Dict, Any
import matplotlib.pyplot as plt
import seaborn as sns


class SolarFaultDetectionModel:
    """Random Forest classifier for solar panel fault detection."""

    def __init__(self, n_estimators: int = 100, random_state: int = 42, **kwargs):
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            random_state=random_state,
            **kwargs
        )
        self.is_trained = False
        self.feature_names = ['voltage', 'current', 'temperature', 'irradiance', 'power']

    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> None:
        print("Training Random Forest model...")
        print(f"Training data shape: {X_train.shape}")
        print(f"Number of classes: {len(np.unique(y_train))}")

        self.model.fit(X_train, y_train)
        self.is_trained = True

        print("Model training completed!")

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict_proba(X)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray,
                 class_names: list = None) -> Dict[str, Any]:

        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")

        print("Evaluating model performance...")

        y_pred = self.predict(X_test)
        y_pred_proba = self.predict_proba(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True)
        cm = confusion_matrix(y_test, y_pred)

        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))

        print(f"\nAccuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=class_names))

        print("\nFeature Importance:")
        for feature, importance in sorted(feature_importance.items(),
                                          key=lambda x: x[1], reverse=True):
            print(f"{feature}: {importance:.4f}")

        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm,
            'feature_importance': feature_importance,
            'predictions': y_pred,
            'prediction_probabilities': y_pred_proba
        }

    def plot_confusion_matrix(self, cm: np.ndarray, class_names: list,
                              save_path: str = None) -> None:

        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=class_names, yticklabels=class_names)

        plt.title('Confusion Matrix - Solar Panel Fault Detection')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)
            print(f"Saved to {save_path}")

        plt.show()

    def plot_feature_importance(self, save_path: str = None) -> None:

        if not self.is_trained:
            raise ValueError("Model must be trained first")

        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance')

        plt.figure(figsize=(10, 6))
        plt.barh(importance_df['feature'], importance_df['importance'])

        plt.title('Feature Importance')
        plt.xlabel('Importance')
        plt.tight_layout()

        if save_path:
            plt.savefig(save_path)
            print(f"Saved to {save_path}")

        plt.show()

    def save_model(self, filepath: str) -> None:
        if not self.is_trained:
            raise ValueError("Train model before saving")

        joblib.dump(self.model, filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath: str) -> None:
        self.model = joblib.load(filepath)
        self.is_trained = True
        print(f"Model loaded from {filepath}")


# ------------------- MAIN EXECUTION -------------------

if __name__ == "__main__":
    print("Starting Solar Fault Detection Model...")

    # Dummy dataset
    X = np.random.rand(100, 5)
    y = np.random.randint(0, 2, 100)

    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    model = SolarFaultDetectionModel()

    model.train(X_train, y_train)

    results = model.evaluate(X_test, y_test, class_names=["Normal", "Fault"])

    model.save_model("solar_model.pkl")

    print("Done 🚀")