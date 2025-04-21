from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
from pathlib import Path

# Load the PyTorch model
def load_model():
    model_path = Path(__file__).parent / "trained_plant_disease_model_complete.pth"
    print("Looking for model at:", model_path)
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    model = torch.load(str(model_path), map_location=torch.device("cpu"), weights_only=False)
    model.eval()
    return model

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load model once at startup
model = load_model()

# Preprocessing transformation
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# Class names and disease details
CLASS_NAMES = [
    'Apple scab', 'Black rot', 'Cedar apple rust', 'Healthy Apple',
    'Healthy Blueberry', 'Cherry Powdery mildew', 'Healthy Cherry',
    'Corn Gray leaf spot', 'Corn Common rust', 'Corn Northern Leaf Blight',
    'Healthy Corn', 'Grape Black rot', 'Grape Black Measles', 'Grape Leaf blight',
    'Healthy Grape', 'Citrus greening', 'Peach Bacterial spot', 'Healthy Peach',
    'Pepper Bacterial spot', 'Healthy Pepper', 'Potato Early blight',
    'Potato Late blight', 'Healthy Potato', 'Healthy Raspberry', 'Healthy Soybean',
    'Squash Powdery mildew', 'Strawberry Leaf scorch', 'Healthy Strawberry',
    'Tomato Bacterial spot', 'Tomato Early blight', 'Tomato Late blight',
    'Tomato Leaf Mold', 'Tomato Septoria leaf spot', 'Tomato Spider mites',
    'Tomato Target Spot', 'Tomato Yellow Leaf Curl Virus', 'Tomato mosaic virus',
    'Healthy Tomato'
]

# Description and treatment dictionary (expand as needed)
DISEASE_DETAILS = {
    "Apple scab": {
        "description": "A fungal disease (Venturia inaequalis) causing dark olive-green to brown lesions on leaves and fruits. Severe infections can lead to defoliation and fruit drop.",
        "treatments": ["Apply fungicide early in the growing season", "Prune affected areas", "Use resistant varieties", "Remove fallen leaves to reduce overwintering spores", "Improve air circulation"]
    },
    "Black rot": {
        "description": "A fungal disease affecting apples, caused by Botryosphaeria obtusa. It produces circular lesions that start purple and turn brown with red margins on leaves and black, rotting spots on fruits.",
        "treatments": ["Apply fungicide during growing season", "Prune out cankers and diseased wood", "Remove mummified fruits", "Maintain good sanitation practices", "Ensure proper tree spacing"]
    },
    "Cedar apple rust": {
        "description": "A fungal disease (Gymnosporangium juniperi-virginianae) causing bright orange-yellow spots on apple leaves and fruits. Requires cedar trees to complete its life cycle.",
        "treatments": ["Apply fungicide preventatively", "Remove nearby cedar/juniper trees if possible", "Plant resistant apple varieties", "Improve air circulation", "Remove infected leaves"]
    },
    "Healthy Apple": {
        "description": "Your apple plant appears healthy. No disease detected.",
        "treatments": ["Continue regular maintenance", "Maintain proper watering", "Apply balanced fertilizer as needed"]
    },
    "Healthy Blueberry": {
        "description": "Your blueberry plant appears healthy. No disease detected.",
        "treatments": ["Maintain acidic soil pH (4.5-5.5)", "Apply organic mulch", "Ensure adequate watering", "Prune annually for best production"]
    },
    "Cherry Powdery mildew": {
        "description": "A fungal disease (Podosphaera clandestina) causing white powdery coating on leaves, shoots, and sometimes fruits. Can cause leaf curling and premature drop.",
        "treatments": ["Apply fungicide at first sign", "Prune to improve air circulation", "Remove and destroy infected plant parts", "Use resistant varieties", "Avoid overhead irrigation"]
    },
    "Healthy Cherry": {
        "description": "Your cherry plant appears healthy. No disease detected.",
        "treatments": ["Regular pruning for airflow", "Provide consistent watering", "Apply appropriate fertilizer", "Monitor for pest activity"]
    },
    "Corn Gray leaf spot": {
        "description": "A fungal disease (Cercospora zeae-maydis) causing rectangular gray to tan lesions between leaf veins. Severe infections reduce yield and predispose plants to stalk rot.",
        "treatments": ["Rotate crops away from corn", "Plant resistant hybrids", "Apply foliar fungicides", "Improve field drainage", "Implement conservation tillage"]
    },
    "Corn Common rust": {
        "description": "A fungal disease (Puccinia sorghi) producing small, circular to elongated orange-brown pustules on both leaf surfaces. Can reduce photosynthesis and yield in severe cases.",
        "treatments": ["Plant resistant hybrids", "Apply fungicides", "Early planting to avoid peak rust season", "Scout fields regularly", "Maintain plant vigor"]
    },
    "Corn Northern Leaf Blight": {
        "description": "A fungal disease (Exserohilum turcicum) causing long, elliptical gray-green lesions that later turn tan-brown. Severe infections can cause significant yield losses.",
        "treatments": ["Rotate crops", "Plant resistant hybrids", "Apply foliar fungicides", "Remove crop debris", "Improve field drainage"]
    },
    "Healthy Corn": {
        "description": "Your corn plant appears healthy. No disease detected.",
        "treatments": ["Ensure adequate nutrients", "Regular watering during key growth stages", "Control weeds", "Monitor for pests"]
    },
    "Grape Black rot": {
        "description": "A fungal disease (Guignardia bidwellii) causing circular tan lesions with dark borders on leaves and black, shriveled fruit with characteristic scabby dots.",
        "treatments": ["Apply fungicide preventatively", "Remove mummified berries and infected leaves", "Improve air circulation through pruning", "Maintain weed-free environment", "Use resistant varieties"]
    },
    "Grape Black Measles": {
        "description": "Also known as Esca, a complex fungal disease causing red-brown spots on leaves with yellow margins and small, dark spots on fruits. Can lead to vine decline and death.",
        "treatments": ["Remove and destroy infected wood", "Protect pruning wounds", "Avoid pruning during wet conditions", "Apply preventative fungicides", "Maintain vine vigor"]
    },
    "Grape Leaf blight": {
        "description": "Also known as Isariopsis Leaf Spot (Pseudocercospora vitis), causing circular dark brown spots with visible margins on leaves. Can cause premature defoliation.",
        "treatments": ["Apply fungicides", "Improve air circulation", "Remove infected leaves", "Avoid overhead watering", "Practice good vineyard sanitation"]
    },
    "Healthy Grape": {
        "description": "Your grape plant appears healthy. No disease detected.",
        "treatments": ["Regular pruning", "Adequate irrigation", "Balanced nutrition", "Ongoing pest monitoring"]
    },
    "Citrus greening": {
        "description": "A bacterial disease (Candidatus Liberibacter) spread by the Asian citrus psyllid. Causes mottled leaves, stunted growth, and misshapen, bitter fruits. Eventually fatal to trees.",
        "treatments": ["Remove infected trees", "Control psyllid vectors", "Use disease-free nursery stock", "Regular scouting", "Apply systemic insecticides", "Maintain optimal nutrition"]
    },
    "Peach Bacterial spot": {
        "description": "A bacterial disease (Xanthomonas arboricola) causing small water-soaked lesions on leaves that develop into angular spots, and dark sunken spots on fruits.",
        "treatments": ["Apply copper-based bactericides", "Prune during dry weather", "Improve air circulation", "Avoid overhead irrigation", "Plant resistant varieties"]
    },
    "Healthy Peach": {
        "description": "Your peach plant appears healthy. No disease detected.",
        "treatments": ["Annual pruning", "Consistent watering schedule", "Apply appropriate fertilizers", "Monitor for pests and diseases"]
    },
    "Pepper Bacterial spot": {
        "description": "A bacterial disease (Xanthomonas campestris) causing water-soaked, circular spots on leaves and raised scabs on fruits. Can cause significant defoliation and yield loss.",
        "treatments": ["Apply copper-based sprays preventatively", "Rotate crops", "Use disease-free seeds", "Remove infected plant debris", "Avoid overhead irrigation"]
    },
    "Healthy Pepper": {
        "description": "Your pepper plant appears healthy. No disease detected.",
        "treatments": ["Regular watering", "Balanced fertilization", "Support tall plants", "Monitor for pests"]
    },
    "Potato Early blight": {
        "description": "A fungal disease (Alternaria solani) causing dark, concentric rings forming target-like patterns on lower leaves. Progresses upward and can cause defoliation.",
        "treatments": ["Apply fungicide preventatively", "Improve air circulation", "Avoid overhead irrigation", "Rotate crops", "Remove infected plant debris"]
    },
    "Potato Late blight": {
        "description": "A devastating water mold disease (Phytophthora infestans) causing water-soaked lesions that rapidly enlarge into brown-black areas on leaves and stems, and firm, dark lesions on tubers.",
        "treatments": ["Apply fungicide at first sign", "Destroy infected plants immediately", "Plant resistant varieties", "Hill soil around plants", "Use certified seed potatoes"]
    },
    "Healthy Potato": {
        "description": "Your potato plant appears healthy. No disease detected.",
        "treatments": ["Regular hilling", "Consistent watering", "Balanced fertilization", "Proper spacing"]
    },
    "Healthy Raspberry": {
        "description": "Your raspberry plant appears healthy. No disease detected.",
        "treatments": ["Regular pruning of old canes", "Provide support structures", "Adequate irrigation", "Apply mulch", "Control weeds"]
    },
    "Healthy Soybean": {
        "description": "Your soybean plant appears healthy. No disease detected.",
        "treatments": ["Proper row spacing", "Adequate irrigation", "Monitor for pests", "Apply appropriate fertilizers"]
    },
    "Squash Powdery mildew": {
        "description": "A fungal disease causing white powdery growth on leaf surfaces, stems, and sometimes fruits. Can reduce photosynthesis and yield, and cause premature senescence.",
        "treatments": ["Apply fungicide preventatively", "Plant resistant varieties", "Improve air circulation", "Apply potassium bicarbonate sprays", "Remove severely infected leaves"]
    },
    "Strawberry Leaf scorch": {
        "description": "A fungal disease (Diplocarpon earlianum) causing purple to red spots that enlarge to form scorched areas on leaves. Can cause severe defoliation and reduced yield.",
        "treatments": ["Apply fungicide preventatively", "Remove infected leaves", "Improve air circulation", "Avoid overhead irrigation", "Renovate beds annually"]
    },
    "Healthy Strawberry": {
        "description": "Your strawberry plant appears healthy. No disease detected.",
        "treatments": ["Apply mulch around plants", "Ensure adequate spacing", "Regular watering", "Remove runners as needed"]
    },
    "Tomato Bacterial spot": {
        "description": "A bacterial disease (Xanthomonas spp.) causing small, water-soaked spots on leaves and raised scabs on fruits. Spots may have yellow halos and cause leaf drop.",
        "treatments": ["Apply copper-based bactericides", "Rotate crops", "Avoid overhead irrigation", "Remove infected plant debris", "Use disease-free seeds"]
    },
    "Tomato Early blight": {
        "description": "A fungal disease (Alternaria solani) causing dark concentric rings forming target-like patterns on lower leaves. Can cause significant defoliation and reduced yield.",
        "treatments": ["Apply fungicide preventatively", "Remove lower infected leaves", "Mulch around plants", "Improve air circulation", "Stake plants for better airflow"]
    },
    "Tomato Late blight": {
        "description": "A destructive water mold disease (Phytophthora infestans) causing large, dark water-soaked lesions on leaves and stems, and firm brown lesions on fruits.",
        "treatments": ["Apply fungicide at first sign", "Remove infected plants immediately", "Improve air circulation", "Water at base of plants", "Plant resistant varieties"]
    },
    "Tomato Leaf Mold": {
        "description": "A fungal disease (Passalora fulva) causing pale green to yellow spots on upper leaf surfaces and olive-green to grayish-brown velvety mold on lower surfaces.",
        "treatments": ["Improve greenhouse ventilation", "Apply fungicide", "Avoid leaf wetness", "Remove infected leaves", "Increase plant spacing"]
    },
    "Tomato Septoria leaf spot": {
        "description": "A fungal disease (Septoria lycopersici) causing numerous small circular spots with dark borders and gray centers on lower leaves. Severe infections cause defoliation.",
        "treatments": ["Apply fungicide preventatively", "Remove infected leaves", "Mulch around plants", "Practice crop rotation", "Stake plants for better airflow"]
    },
    "Tomato Spider mites": {
        "description": "Tiny arachnid pests causing stippling on leaves from feeding, fine webbing, and yellowing/bronzing of foliage. Severe infestations lead to leaf drop and reduced yield.",
        "treatments": ["Apply miticide or insecticidal soap", "Increase humidity", "Introduce predatory mites", "Strong water spray to dislodge mites", "Remove severely infested plants"]
    },
    "Tomato Target Spot": {
        "description": "A fungal disease (Corynespora cassiicola) causing circular brown lesions with concentric rings on leaves, stems, and fruits. Can cause significant defoliation.",
        "treatments": ["Apply fungicide preventatively", "Remove infected leaves", "Improve air circulation", "Avoid overhead irrigation", "Practice crop rotation"]
    },
    "Tomato Yellow Leaf Curl Virus": {
        "description": "A devastating viral disease spread by whiteflies causing upward leaf curling, yellowing, stunted growth, and flower drop. Results in severely reduced yield.",
        "treatments": ["Control whitefly vectors", "Remove infected plants", "Use virus-resistant varieties", "Use reflective mulches", "Apply insecticides to control vectors"]
    },
    "Tomato mosaic virus": {
        "description": "A viral disease causing mottled green-yellow areas on leaves, distortion, and sometimes stunting. Fruits may show yellow rings or blotches. Spread through handling and tools.",
        "treatments": ["Remove infected plants", "Disinfect tools", "Control insect vectors", "Use virus-resistant varieties", "Wash hands before handling plants"]
    },
    "Healthy Tomato": {
        "description": "Your tomato plant appears healthy. No disease detected.",
        "treatments": ["Regular pruning", "Consistent watering", "Provide support/staking", "Apply balanced fertilizer"]
    }
}

# Prediction endpoint
@app.route("/process", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"result": "No image file provided."}), 400

    file = request.files["image"]

    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return jsonify({"result": f"Error reading image: {str(e)}"}), 400

    # Preprocess image
    input_tensor = preprocess(image)
    input_batch = input_tensor.unsqueeze(0)

    # Model prediction
    with torch.no_grad():
        output = model(input_batch)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        predicted_idx = torch.argmax(probabilities).item()
        predicted_class = CLASS_NAMES[predicted_idx]

    # Get disease details
    details = DISEASE_DETAILS.get(predicted_class, {
        "description": "No specific description available.",
        "treatments": ["Consult an agricultural expert."]
    })

    # Prepare result
    result = {
        "predicted_class": predicted_class,
        "description": details["description"],
        "treatments": details["treatments"]
    }

    return jsonify(result)

# Run the app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
