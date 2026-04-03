import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type DetectionID = Nat;

  type DetectionRecord = {
    id : DetectionID;
    timestamp : Int;
    plantType : Text;
    diseaseName : Text;
    confidence : Float;
    modelUsed : Text;
    severity : Text;
  };

  module DetectionRecord {
    public func compare(d1 : DetectionRecord, d2 : DetectionRecord) : Order.Order {
      Int.compare(d2.timestamp, d1.timestamp);
    };
  };

  type ModelMetrics = {
    modelName : Text;
    accuracy : Float;
    validationAccuracy : Float;
    loss : Float;
    validationLoss : Float;
    inferenceTimeMs : Float;
    parameters : Nat;
  };

  type DiseaseInfo = {
    id : Nat;
    plantType : Text;
    diseaseName : Text;
    symptoms : Text;
    treatment : Text;
    prevention : Text;
    severity : Text;
  };

  // Persistent data structures
  let detectionRecords = Map.empty<DetectionID, DetectionRecord>();
  var nextDetectionId : DetectionID = 1;

  let modelMetrics = Map.empty<Text, ModelMetrics>();
  let diseaseInfo = Map.empty<Text, DiseaseInfo>();

  // Seed model metrics
  func initModelMetrics() {
    let googleNet : ModelMetrics = {
      modelName = "GoogleNet";
      accuracy = 96.5;
      validationAccuracy = 95.2;
      loss = 0.12;
      validationLoss = 0.15;
      inferenceTimeMs = 45.0;
      parameters = 13000000;
    };

    let resNet : ModelMetrics = {
      modelName = "ResNet";
      accuracy = 97.8;
      validationAccuracy = 96.7;
      loss = 0.09;
      validationLoss = 0.12;
      inferenceTimeMs = 52.0;
      parameters = 11600000;
    };

    let mobileNet : ModelMetrics = {
      modelName = "MobileNet";
      accuracy = 94.8;
      validationAccuracy = 93.5;
      loss = 0.18;
      validationLoss = 0.21;
      inferenceTimeMs = 27.0;
      parameters = 4200000;
    };

    modelMetrics.add("GoogleNet", googleNet);
    modelMetrics.add("ResNet", resNet);
    modelMetrics.add("MobileNet", mobileNet);
  };

  // Seed disease info
  func initDiseaseInfo() {
    [
      {
        id = 1;
        plantType = "Tomato";
        diseaseName = "Early Blight";
        symptoms = "Dark spots on leaves, stem lesions";
        treatment = "Fungicides, remove infected leaves";
        prevention = "Crop rotation, proper spacing";
        severity = "Moderate";
      },
      {
        id = 2;
        plantType = "Tomato";
        diseaseName = "Late Blight";
        symptoms = "Water-soaked lesions, white mold";
        treatment = "Fungicides, remove infected plants";
        prevention = "Clean tools, resistant varieties";
        severity = "Severe";
      },
      {
        id = 3;
        plantType = "Potato";
        diseaseName = "Potato Scab";
        symptoms = "Corky lesions on tubers";
        treatment = "Use certified seed potatoes";
        prevention = "Rotate crops, maintain soil pH";
        severity = "Mild";
      },
      {
        id = 4;
        plantType = "Apple";
        diseaseName = "Apple Scab";
        symptoms = "Olive green spots on leaves, fruit lesions";
        treatment = "Fungicides, remove fallen leaves";
        prevention = "Prune trees, resistant varieties";
        severity = "Moderate";
      },
      {
        id = 5;
        plantType = "Grape";
        diseaseName = "Powdery Mildew";
        symptoms = "White powdery patches on leaves";
        treatment = "Fungicides, improve air circulation";
        prevention = "Proper spacing, resistant varieties";
        severity = "Moderate";
      },
      {
        id = 6;
        plantType = "Pepper";
        diseaseName = "Bacterial Spot";
        symptoms = "Dark, water-soaked spots on leaves";
        treatment = "Copper-based sprays";
        prevention = "Clean seeds, avoid overhead watering";
        severity = "Moderate";
      },
      {
        id = 7;
        plantType = "Corn";
        diseaseName = "Northern Corn Leaf Blight";
        symptoms = "Cigar-shaped lesions on leaves";
        treatment = "Fungicides, remove crop debris";
        prevention = "Rotate crops, resistant varieties";
        severity = "Moderate";
      },
      {
        id = 8;
        plantType = "Tomato";
        diseaseName = "Septoria Leaf Spot";
        symptoms = "Small, circular spots with brown borders";
        treatment = "Remove infected leaves, fungicides";
        prevention = "Crop rotation, proper spacing";
        severity = "Mild";
      },
      {
        id = 9;
        plantType = "Tomato";
        diseaseName = "Yellow Leaf Curl Virus";
        symptoms = "Yellowing, curling leaves, stunted growth";
        treatment = "Remove infected plants";
        prevention = "Use resistant varieties, control whiteflies";
        severity = "Severe";
      },
      {
        id = 10;
        plantType = "Potato";
        diseaseName = "Black Leg";
        symptoms = "Blackened stems, wilting";
        treatment = "Remove infected plants, improve drainage";
        prevention = "Use certified seed, avoid wet conditions";
        severity = "Severe";
      },
      {
        id = 11;
        plantType = "Apple";
        diseaseName = "Fire Blight";
        symptoms = "Wilting, blackening of shoots";
        treatment = "Prune infected branches, antibiotics";
        prevention = "Resistant varieties, avoid excess nitrogen";
        severity = "Severe";
      },
      {
        id = 12;
        plantType = "Grape";
        diseaseName = "Downy Mildew";
        symptoms = "Yellow spots on leaves, white growth on underside";
        treatment = "Fungicides, remove infected leaves";
        prevention = "Proper spacing, resistant varieties";
        severity = "Moderate";
      },
      {
        id = 13;
        plantType = "Pepper";
        diseaseName = "Phytophthora Blight";
        symptoms = "Dark, water-soaked spots on stems and fruits";
        treatment = "Fungicides, improve drainage";
        prevention = "Rotate crops, avoid excess moisture";
        severity = "Severe";
      },
      {
        id = 14;
        plantType = "Corn";
        diseaseName = "Common Rust";
        symptoms = "Reddish-brown pustules on leaves";
        treatment = "Resistant varieties, fungicides";
        prevention = "Rotate crops, clean debris";
        severity = "Mild";
      },
      {
        id = 15;
        plantType = "Tomato";
        diseaseName = "Bacterial Spot";
        symptoms = "Water-soaked spots on leaves and fruits";
        treatment = "Copper-based sprays, remove infected plants";
        prevention = "Clean seeds, avoid overhead watering";
        severity = "Moderate";
      },
    ].forEach(func(info) { diseaseInfo.add(info.diseaseName, info) });
  };

  // Initialize persistent data
  initModelMetrics();
  initDiseaseInfo();

  // Save detection record
  public shared ({ caller }) func saveDetection(plantType : Text, diseaseName : Text, confidence : Float, modelUsed : Text, severity : Text) : async DetectionID {
    let detection : DetectionRecord = {
      id = nextDetectionId;
      timestamp = Time.now();
      plantType;
      diseaseName;
      confidence;
      modelUsed;
      severity;
    };

    detectionRecords.add(nextDetectionId, detection);
    nextDetectionId += 1;
    detection.id;
  };

  // Get detection history (last 100 records, most recent first)
  public query ({ caller }) func getDetectionHistory() : async [DetectionRecord] {
    let allRecords = detectionRecords.values().toArray();
    let sortedRecords = allRecords.sort();

    let resultSize = if (sortedRecords.size() > 100) { 100 } else {
      sortedRecords.size();
    };
    sortedRecords.sliceToArray(0, resultSize);
  };

  // Get model metrics
  public query ({ caller }) func getModelMetrics() : async [ModelMetrics] {
    modelMetrics.values().toArray();
  };

  // Get disease info by name
  public query ({ caller }) func getDiseaseInfo(diseaseName : Text) : async DiseaseInfo {
    switch (diseaseInfo.get(diseaseName)) {
      case (null) { Runtime.trap("Disease not found") };
      case (?info) { info };
    };
  };

  // Get all disease entries
  public query ({ caller }) func getAllDiseases() : async [DiseaseInfo] {
    diseaseInfo.values().toArray();
  };

  // Clear detection history
  public shared ({ caller }) func clearHistory() : async () {
    detectionRecords.clear();
    nextDetectionId := 1;
  };
};
