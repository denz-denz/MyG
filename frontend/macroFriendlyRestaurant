import SwiftUI
import MapKit
import CoreLocation

// Struct for Identified Map Items
struct IdentifiedMapItem: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
}

// Location Manager for permission and user location
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var userLocation: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus

    private let manager = CLLocationManager()

    override init() {
        self.authorizationStatus = manager.authorizationStatus
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        self.authorizationStatus = manager.authorizationStatus
        if authorizationStatus == .authorizedWhenInUse || .authorizedAlways == authorizationStatus {
            manager.startUpdatingLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let loc = locations.last {
            userLocation = loc
        }
    }
}

// Main Map View
struct MacroFriendlyMapView: View {
    @StateObject private var locManager = LocationManager()

    @State private var cameraPosition = MapCameraPosition.region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 1.3521, longitude: 103.8198), // Singapore
            span: MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
        )
    )

    @State private var places: [IdentifiedMapItem] = []

    var body: some View {
        ZStack {
            Map(position: $cameraPosition, interactionModes: .all, showsUserLocation: true) {
                ForEach(places) { item in
                    Marker(item.name, coordinate: item.coordinate)
                }
            }
            .ignoresSafeArea()

            if locManager.authorizationStatus == .notDetermined {
                Color.black.opacity(0.4)
                VStack(spacing: 16) {
                    Text("Allow location access to find nearby macro-friendly spots.")
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding()
                    Button("Allow Location") {
                        locManager.requestPermission()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
            }
        }
        .onAppear {
            loadGeoJSON()
        }
        .onReceive(locManager.$userLocation.compactMap { $0 }) { loc in
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: loc.coordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
                )
            )
        }
        .navigationTitle("Healthier Eateries in SG")
    }

    private func loadGeoJSON() {
        guard let url = Bundle.main.url(forResource: "HealthierEateries", withExtension: "geojson"),
              let data = try? Data(contentsOf: url),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let features = json["features"] as? [[String: Any]] else {
            print("❌ Failed to load GeoJSON")
            return
        }

        self.places = features.compactMap { feature in
            guard
                let geometry = feature["geometry"] as? [String: Any],
                let coords = geometry["coordinates"] as? [Double],
                coords.count >= 2,
                let props = feature["properties"] as? [String: Any],
                let descHTML = props["Description"] as? String
            else { return nil }

            // Extract the actual NAME from the Description HTML using regex
            let regex = try? NSRegularExpression(pattern: "<th>NAME</th> *<td>(.*?)</td>", options: [])
            let range = NSRange(descHTML.startIndex..<descHTML.endIndex, in: descHTML)
            let match = regex?.firstMatch(in: descHTML, options: [], range: range)
            let name: String

            if let match = match, let nameRange = Range(match.range(at: 1), in: descHTML) {
                name = String(descHTML[nameRange])
            } else {
                // fallback to LANDYADDRESSPOINT or generic label
                name = props["LANDYADDRESSPOINT"] as? String ?? "Healthy Eatery"
            }

            let coordinate = CLLocationCoordinate2D(latitude: coords[1], longitude: coords[0])
            return IdentifiedMapItem(name: name, coordinate: coordinate)
        }

        print("✅ Loaded \(places.count) eateries from GeoJSON")
    }

}

// Preview
struct MacroFriendlyMapView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            MacroFriendlyMapView()
        }
    }
}
