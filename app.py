from flask import (
    Flask, render_template,
    request, jsonify, send_from_directory
)
import os
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Folder to save images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload/<user_id>', methods=['POST'])
def upload_image(user_id):
    try:
        # Get image data from request
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({
                'ok': False,
                'description': 'No image data provided'
            }), 400
        
        # Decode the base64 image data
        img_data = base64.b64decode(image_data.split(',')[1])
        img = Image.open(BytesIO(img_data))
        
        # Save the image
        image_filename = f'{user_id}.png'
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        img.save(image_path)

        return jsonify({'ok': True, 'message': 'Image uploaded successfully'}), 200

    except Exception as e:
        return jsonify({'ok': False, 'description': str(e)}), 500

@app.route('/uploads/<user_id>')
def get_image(user_id):
    # Serve the saved image from the uploads folder
    return send_from_directory(app.config['UPLOAD_FOLDER'], f"{user_id}.png")


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

