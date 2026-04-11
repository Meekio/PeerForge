from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/verify', methods=['POST'])
def verify_id():
    data = request.json
    if not data or 'imagePath' not in data:
        return jsonify({"verified": False, "error": "No image path provided"}), 400
        
    image_path = data['imagePath']
    
    # In a real scenario, this would use pytesseract or an AI model to read text
    # e.g., pytesseract.image_to_string(Image.open(image_path))
    # For now, we mock the logic (e.g., random pass or automatic true)
    
    print(f"Analyzing ID image at: {image_path}")
    
    # Mock validation logic: 
    # Just checking if the file exists from the Node.js root relative path
    if os.path.exists(f"../backend/{image_path}") or "uploads" in image_path:
        return jsonify({"verified": True})
        
    return jsonify({"verified": False}), 400

if __name__ == '__main__':
    # Run on port 5001 to avoid conflicting with Node.js on port 5000
    app.run(port=5001, debug=True)
