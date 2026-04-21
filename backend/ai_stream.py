from ultralytics import YOLO
import numpy as np
import cv2
import time
import threading

# Use pretrained model for now (since best.pt is missing)
model = YOLO("yolov8n.pt")

class_names = ["person", "car", "building", "tree"]

latest_action = "NORMAL"
latest_frame = None
lock = threading.Lock()


# ---------------------------
# RECEIVE FRAME FROM BACKEND
# ---------------------------
def update_frame(image_bytes):
    global latest_frame

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    with lock:
        latest_frame = frame


# ---------------------------
# PROCESS ONE FRAME
# ---------------------------
def process_frame():
    global latest_action, latest_frame

    with lock:
        if latest_frame is None:
            return latest_action
        frame = latest_frame.copy()

    results = model(frame)

    action = "NORMAL"

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            label = class_names[cls_id] if cls_id < len(class_names) else "unknown"

            if label == "person":
                action = "SLOW_DOWN"
            elif label in ["tree", "building"]:
                action = "MOVE_UP"

    latest_action = action
    return latest_action


# ---------------------------
# BACKGROUND AI LOOP (REALTIME)
# ---------------------------
def run_ai_loop():
    global latest_action

    while True:
        try:
            if latest_frame is not None:
                process_frame()
        except Exception as e:
            print("AI LOOP ERROR:", e)

        time.sleep(0.3)  # 300ms real-time processing


# Start loop automatically when file loads
threading.Thread(target=run_ai_loop, daemon=True).start()


# ---------------------------
# GET CURRENT ACTION
# ---------------------------
def get_latest_action():
    return latest_action








