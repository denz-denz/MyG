import SwiftUI
import Charts   // Requires iOS 16+

// MARK: – Model for a single Set
struct ExerciseSet: Identifiable, Codable {
    var id = UUID()
    var weight: Double = 0
    var reps: Int = 0
}

// MARK: – Model for an Exercise
struct Exercise: Identifiable, Codable {
    var id: UUID = UUID()
    var name: String
    var sets: [ExerciseSet]
    var lastEntryDate: String  // “dd/MM/yyyy”

    init(id: UUID = UUID(),
         name: String,
         sets: [ExerciseSet] = [],
         lastEntryDate: String = "")
    {
        self.id = id
        self.name = name
        self.sets = sets
        self.lastEntryDate = lastEntryDate
    }

    /// Total volume = sum(weight × reps)
    var totalVolume: Double {
        sets.reduce(0) { $0 + ($1.weight * Double($1.reps)) }
    }
}

// MARK: – Persistent Store
class ExerciseStore: ObservableObject {
    @Published var exercises: [Exercise] = []
    @Published var history: [UUID: [String: Double]] = [:]

    private let exKey   = "savedExercises"
    private let histKey = "savedHistory"

    init() { load() }

    func load() {
        let decoder = JSONDecoder()
        if let data = UserDefaults.standard.data(forKey: exKey),
           let arr  = try? decoder.decode([Exercise].self, from: data) {
            exercises = arr
        }
        if let data = UserDefaults.standard.data(forKey: histKey),
           let dict = try? decoder.decode([UUID: [String: Double]].self, from: data) {
            history = dict
        }
    }

    func save() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(exercises) {
            UserDefaults.standard.set(data, forKey: exKey)
        }
        if let data = try? encoder.encode(history) {
            UserDefaults.standard.set(data, forKey: histKey)
        }
    }
}

// MARK: – Main View
struct HomeView: View {
    @StateObject private var store = ExerciseStore()
    @State private var newExerciseName = ""
    @State private var expandedIDs: Set<UUID> = []

    /// Today in “dd/MM/yyyy”
    private var todayString: String {
        let f = DateFormatter(); f.dateFormat = "dd/MM/yyyy"
        return f.string(from: Date())
    }

    var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: true) {
                LazyVStack(spacing: 16) {

                    // Header
                    headerView

                    // Each exercise card
                    ForEach(store.exercises.indices, id: \.self) { idx in
                        let exID = store.exercises[idx].id

                        ExerciseCardView(
                            exercise: $store.exercises[idx],
                            expandedIDs: $expandedIDs,
                            history: $store.history,
                            todayString: todayString
                        ) {
                            // onDelete
                            expandedIDs.remove(exID)
                            store.history[exID] = nil
                            store.exercises.remove(at: idx)
                        }
                        .onAppear {
                            // reset sets on a new day
                            if store.exercises[idx].lastEntryDate != todayString {
                                store.exercises[idx].sets = []
                                store.exercises[idx].lastEntryDate = todayString
                            }
                        }
                    }

                    // Add new exercise
                    addExerciseView

                    Spacer(minLength: 16)
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)
            }
            .navigationTitle("Home")
            // Persist on any change
            .onReceive(store.$exercises) { _ in store.save() }
            .onReceive(store.$history)   { _ in store.save() }
        }
    }

    private var headerView: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Progress Tracker")
                    .font(.title2).bold()
                Text("“Slow progress is better than no progress”")
                    .font(.caption).foregroundColor(.gray)
            }
            Spacer()
            Text(todayString)
                .font(.headline).bold()
        }
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }

    private var addExerciseView: some View {
        HStack(spacing: 8) {
            TextField("Add new exercise", text: $newExerciseName)
                .textFieldStyle(.roundedBorder)
            Button("Add") {
                guard !newExerciseName.isEmpty else { return }
                let newEx = Exercise(
                    name: newExerciseName,
                    sets: [],
                    lastEntryDate: todayString
                )
                store.exercises.append(newEx)
                newExerciseName = ""
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(.vertical, 8)
    }
}

// MARK: – Collapsible Exercise Card
struct ExerciseCardView: View {
    @Binding var exercise: Exercise
    @Binding var expandedIDs: Set<UUID>
    @Binding var history: [UUID: [String: Double]]
    let todayString: String
    let onDelete: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Header row
            HStack(spacing: 12) {
                Text(exercise.name).font(.headline)
                Spacer()
                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                        .font(.title3)
                }
                Button {
                    if expandedIDs.contains(exercise.id) {
                        expandedIDs.remove(exercise.id)
                    } else {
                        // record today’s volume
                        var h = history[exercise.id] ?? [:]
                        h[todayString] = max(h[todayString] ?? 0, exercise.totalVolume)
                        history[exercise.id] = h
                        expandedIDs.insert(exercise.id)
                    }
                } label: {
                    Image(systemName:
                        expandedIDs.contains(exercise.id)
                          ? "minus.circle.fill"
                          : "plus.circle.fill"
                    )
                    .font(.title3)
                    .foregroundColor(.blue)
                }
            }
            .padding(12)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)

            // Expanded content
            if expandedIDs.contains(exercise.id) {
                VStack(alignment: .leading, spacing: 8) {

                    // Steppers + manual input + remove button
                    ForEach(exercise.sets.indices, id: \.self) { setIdx in
                        HStack(spacing: 8) {
                            // Weight input + stepper
                            HStack(spacing: 4) {
                                TextField(
                                    "",
                                    value: $exercise.sets[setIdx].weight,
                                    format: .number
                                )
                                .keyboardType(.decimalPad)
                                .frame(minWidth: 50)
                                .textFieldStyle(.roundedBorder)

                                Text("kg")
                                    .font(.subheadline)

                                Stepper("", value: $exercise.sets[setIdx].weight,
                                         in: 0...500, step: 1)
                                .labelsHidden()
                            }
                            .fixedSize(horizontal: true, vertical: false)

                            // Reps input + stepper
                            HStack(spacing: 4) {
                                TextField(
                                    "",
                                    value: $exercise.sets[setIdx].reps,
                                    format: .number
                                )
                                .keyboardType(.numberPad)
                                .frame(minWidth: 40)
                                .textFieldStyle(.roundedBorder)

                                Text("reps")
                                    .font(.subheadline)
                                    .lineLimit(1)
                                    .layoutPriority(1)

                                Stepper("", value: $exercise.sets[setIdx].reps,
                                         in: 0...50, step: 1)
                                .labelsHidden()
                            }
                            .fixedSize(horizontal: true, vertical: false)

                            // remove set
                            Button {
                                exercise.sets.remove(at: setIdx)
                            } label: {
                                Image(systemName: "minus.circle")
                                    .foregroundColor(.red)
                            }
                        }
                        .font(.subheadline)
                    }

                    // + Add Set
                    Button {
                        exercise.sets.append(ExerciseSet())
                    } label: {
                        Label("Add Set", systemImage: "plus.circle")
                    }
                    .padding(.top, 4)

                    // Disclaimer
                    Text("Total weight moved")
                        .font(.caption)
                        .foregroundColor(.gray)

                    // Line chart of totalVolume history
                    if let hist = history[exercise.id], !hist.isEmpty {
                        Chart {
                            ForEach(hist.sorted(by: { $0.key < $1.key }), id: \.key) { date, vol in
                                LineMark(
                                    x: .value("Date", date),
                                    y: .value("Volume", vol)
                                )
                                PointMark(
                                    x: .value("Date", date),
                                    y: .value("Volume", vol)
                                )
                            }
                        }
                        .chartYAxis { AxisMarks(position: .leading) }
                        .frame(height: 100)
                    } else {
                        Text("No history yet")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                .padding(10)
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.top, 4)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .animation(.default, value: expandedIDs)
    }
}

#Preview {
    HomeView()
}

