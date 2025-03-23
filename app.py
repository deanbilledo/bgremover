from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import uuid
import numpy as np
import cv2
from rembg import remove
from PIL import Image
import io

app = Flask(__name__, static_folder='static')

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = str(uuid.uuid4()) + file_extension
        
        # Save original image
        upload_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(upload_path)
        
        # Process image to remove background
        try:
            # Read image
            input_image = Image.open(upload_path)
            
            # Remove background
            output_image = remove(input_image)
            
            # Save processed image
            result_filename = os.path.splitext(unique_filename)[0] + '.png'
            result_path = os.path.join(RESULT_FOLDER, result_filename)
            output_image.save(result_path)
            
            return jsonify({
                'success': True,
                'original': f'/uploads/{unique_filename}',
                'processed': f'/results/{result_filename}'
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/results/<filename>')
def processed_file(filename):
    return send_from_directory(RESULT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)