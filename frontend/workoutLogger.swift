import SwiftUI
import Charts

// MARK: - Normalization Helper
func normalizedName(_ name: String) -> String {
    name
        .trimmingCharacters(in: .whitespacesAndNewlines)
        .lowercased()
        .replacingOccurrences(of: "-", with: " ")
        .replacingOccurrences(of: "_", with: " ")
        .replacingOccurrences(of: "  ", with: " ")
}

// MARK: - Models
struct ExerciseSet: Identifiable, Codable {
    var id = UUID()
    var weight: Double = 0
    var reps: Int = 0
}

struct Exercise: Identifiable, Codable {
        var id = UUID()
        var name: String
        var sets: Int
        var reps: [Int]
        var weights: [Double]
        var exerciseVolume: Double?
        var lastEntryDate: String = ""

        var exerciseSets: [ExerciseSet] {
            get {
                (0..<min(reps.count, weights.count)).map { i in
                    ExerciseSet(weight: weights[i], reps: reps[i])
                }
            }
            set {
                reps = newValue.map { $0.reps }
                weights = newValue.map { $0.weight }
                sets = newValue.count
            }
        }

        enum CodingKeys: String, CodingKey {
            case name, sets, reps, weights, exerciseVolume
        }
}

struct Workout: Identifiable, Codable {
    var userId : String
    var date: String
    var name: String
    var exercises: [Exercise]
    var workoutVolume: Double?
    var id : String
}

// MARK: - Store
class WorkoutStore: ObservableObject {
    @Published var workouts: [Workout] = []
    private let workoutsKey = "savedWorkouts"

    init() { load() }

    func load() {
        let decoder = JSONDecoder()
        if let data = UserDefaults.standard.data(forKey: workoutsKey),
           let arr = try? decoder.decode([Workout].self, from: data) {
            workouts = arr
        }
    }

    func save() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(workouts) {
            UserDefaults.standard.set(data, forKey: workoutsKey)
        }
    }

    func allExerciseNames() -> Set<String> {
        Set(workouts.flatMap { $0.exercises.map { normalizedName($0.name) } })
    }
    
    func loadFromBackend(userId: String) {
        WorkoutService.shared.getAllWorkouts(userId: userId) { workoutsFromServer in
            DispatchQueue.main.async {
                self.workouts = workoutsFromServer
                self.save()
            }
        }
    }
}

// MARK: - ExerciseCardView
struct ExerciseCardView: View {
    @Binding var exercise: Exercise
    @Binding var expandedIDs: Set<UUID>
    @State private var isSynced = false
    let todayString: String
    let workoutId: String
    let onDelete: () -> Void
    @AppStorage("userId") private var userId: String = ""

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(exercise.name).font(.headline)
                Spacer()
                Button(action: onDelete) {
                    Image(systemName: "trash").foregroundColor(.red)
                }
                Button {
                    if expandedIDs.contains(exercise.id) {
                        expandedIDs.remove(exercise.id)
                    } else {
                        expandedIDs.insert(exercise.id)
                        if exercise.exerciseSets.isEmpty {
                            exercise.exerciseSets.append(ExerciseSet())
                        }
                    }
                } label: {
                    Image(systemName: expandedIDs.contains(exercise.id) ? "minus.circle.fill" : "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)

            if expandedIDs.contains(exercise.id) {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(exercise.exerciseSets.indices, id: \.self) { setIdx in
                        let weightBinding = Binding<Double>(
                            get: { exercise.exerciseSets[setIdx].weight },
                            set: { newValue in
                                var sets = exercise.exerciseSets
                                sets[setIdx].weight = newValue
                                exercise.exerciseSets = sets
                            }
                        )

                        let repsBinding = Binding<Int>(
                            get: { exercise.exerciseSets[setIdx].reps },
                            set: { newValue in
                                var sets = exercise.exerciseSets
                                sets[setIdx].reps = newValue
                                exercise.exerciseSets = sets
                            }
                        )

                        HStack(spacing: 16) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Weight")
                                    .font(.caption)
                                    .foregroundColor(.gray)

                                HStack(spacing: 4) {
                                    TextField("0", value: weightBinding, format: .number)
                                        .keyboardType(.decimalPad)
                                        .frame(width: 50)
                                        .textFieldStyle(.roundedBorder)

                                    Text("kg")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)

                                    Stepper("", value: weightBinding, in: 0...500, step: 1)
                                        .labelsHidden()
                                }
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Reps")
                                    .font(.caption)
                                    .foregroundColor(.gray)

                                HStack(spacing: 4) {
                                    TextField("0", value: repsBinding, format: .number)
                                        .keyboardType(.numberPad)
                                        .frame(width: 40)
                                        .textFieldStyle(.roundedBorder)

                                    Text("reps")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)

                                    Stepper("", value: repsBinding, in: 0...50, step: 1)
                                        .labelsHidden()
                                }
                            }

                            Spacer()

                            Button {
                                var sets = exercise.exerciseSets
                                sets.remove(at: setIdx)
                                exercise.exerciseSets = sets
                            } label: {
                                Image(systemName: "minus.circle")
                                    .foregroundColor(.red)
                            }
                        }
                    }

                    // ✅ Add Set Button
                    Button {
                        exercise.exerciseSets.append(ExerciseSet())
                    } label: {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Add Set")
                        }
                    }
                    .padding(.top, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // ✅ Centered Let's Go Button
                    if !exercise.reps.isEmpty && !exercise.weights.isEmpty {
                        HStack {
                            Spacer()
                            Button("Let's Go 🚀") {
                                let payload = Exercise(
                                    name: exercise.name,
                                    sets: exercise.exerciseSets.count,
                                    reps: exercise.exerciseSets.map { $0.reps },
                                    weights: exercise.exerciseSets.map { $0.weight },
                                    exerciseVolume: nil,
                                    lastEntryDate: todayString
                                )
                                WorkoutService.shared.addExercise(workoutId: workoutId, exercise: payload) { result in
                                    switch result {
                                    case .success:
                                        print("✅ Exercise synced successfully")
                                        DispatchQueue.main.async {
                                               expandedIDs.remove(exercise.id)
                                           }
                                        DispatchQueue.main.async {
                                                    isSynced = true
                                                    expandedIDs.remove(exercise.id)
                                            }
                                    case .failure(let error):
                                        print("❌ Sync failed:", error.localizedDescription)
                                    }
                                }
                            }
                            .padding(.top, 8)
                            .buttonStyle(.borderedProminent)
                            Spacer()
                        }
                    }
                }
                .padding()
                .background(isSynced ? Color.green.opacity(0.2) : Color(.secondarySystemBackground))
                .cornerRadius(12)
                .padding(.top, 4)
            }
        }
        .animation(.default, value: expandedIDs)
    }
}

// MARK: - WorkoutDetailView
struct WorkoutDetailView: View {
    @Binding var workout: Workout
    let todayString: String
    var allExerciseNames: Set<String>
    @AppStorage("userId") private var userId: String = ""
    @ObservedObject var store: WorkoutStore

    @State private var expandedIDs: Set<UUID> = []
    @State private var newExerciseName = ""

    var suggestedName: String? {
        let input = normalizedName(newExerciseName)
        return allExerciseNames.first(where: { $0.hasPrefix(input) && input.count > 1 && input != $0 })
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(workout.exercises.indices, id: \.self) { idx in
                    
                    ExerciseCardView(
                        exercise: $workout.exercises[idx],
                        expandedIDs: $expandedIDs,
                        todayString: todayString,
                        workoutId: workout.id
                    ) {
                        let removedExercise = workout.exercises[idx]
                        let name = removedExercise.name
                        let workoutId = workout.id
                        let removedId = removedExercise.id  // safer than using exID from outside scope
                        
                        WorkoutService.shared.removeExercise(workoutId: workoutId, exerciseName: name) { result in
                            DispatchQueue.main.async {
                                switch result {
                                case .success:
                                    print("✅ Exercise removed from backend")
                                case .failure(let error):
                                    print("❌ Failed to remove from backend:", error.localizedDescription)
                                }
                                
                                // Always remove locally
                                expandedIDs.remove(removedId)
                                workout.exercises.remove(at: idx)
                            }
                        }
                    }
                    .onAppear {
                        if workout.exercises[idx].exerciseSets.isEmpty {
                            workout.exercises[idx].lastEntryDate = todayString
                        }
                    }
                }
                
                HStack {
                    TextField("Add new exercise", text: $newExerciseName)
                        .textFieldStyle(.roundedBorder)
                    Button("Add") {
                        let finalName = suggestedName ?? newExerciseName
                        let newEx = Exercise(
                            name: finalName,
                            sets: 0,
                            reps: [],
                            weights: [],
                            exerciseVolume: nil,
                            lastEntryDate: todayString
                        )
                        workout.exercises.append(newEx)
                        newExerciseName = ""
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(.horizontal)
                
                if let suggestion = suggestedName {
                    Text("🔁 Did you mean: \(suggestion)?")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal)
                        .onTapGesture {
                            newExerciseName = suggestion
                        }
                }
                Button {
                    WorkoutService.shared.logWorkout(workoutId: workout.id) { result in
                        DispatchQueue.main.async {
                            switch result {
                            case .success:
                                print("✅ Workout logged successfully")
                                store.loadFromBackend(userId: userId)
                            case .failure(let error):
                                print("❌ Failed to log workout:", error.localizedDescription)
                            }
                        }
                    }
                } label: {
                    Text("📝 Log Workout")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                .padding(.horizontal)
            }
            .padding()
        }
        .navigationTitle(workout.name.isEmpty ? "Workout" : workout.name)
    }
}

// MARK: - AddWorkoutSheet
struct AddWorkoutSheet: View {
    @ObservedObject var store: WorkoutStore
    var todayString: String
    @Binding var isPresented: Bool
    @AppStorage("userId") private var userId: String = ""
    @State private var workoutName = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Workout Name") {
                    TextField("E.g. Push Day, Cardio, etc.", text: $workoutName)
                }

                Section {
                    Button("Add Workout") {
                        WorkoutService.shared.startWorkout(userId: userId, date: todayString, name: workoutName) { result in
                            DispatchQueue.main.async {
                                switch result {
                                case .success(let workoutId):
                                    let newWorkout = Workout(userId: userId, date: todayString, name: workoutName, exercises: [], workoutVolume: nil, id: workoutId)
                                    store.workouts.append(newWorkout)
                                    isPresented = false
                                case .failure(let error):
                                    print("Failed to start workout: \(error.localizedDescription)")
                                }
                            }
                        }
                    }
                    .disabled(workoutName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .navigationTitle("New Workout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
            }
        }
    }
}

// MARK: - HomeView
struct HomeView: View {
    @StateObject private var store = WorkoutStore()
    @State private var showAddWorkoutSheet = false
    @AppStorage("userId") private var userId: String = ""

    var todayString: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("🏋️‍♂️ Welcome Back!")
                            .font(.title2.bold())
                        Text("“One day or Day one.”")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.indigo.opacity(0.1))
                    .cornerRadius(16)
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())

                Section {
                    if store.workouts.isEmpty {
                        VStack(spacing: 8) {
                            Text("No workouts yet").font(.headline)
                            Text("Start your fitness journey today 💪")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 20)
                        .listRowBackground(Color.clear)
                    } else {
                        ForEach(store.workouts) { workout in
                            NavigationLink {
                                WorkoutDetailView(
                                    workout: binding(for: workout),
                                    todayString: todayString,
                                    allExerciseNames: store.allExerciseNames(),
                                    store: store
                                )
                            } label: {
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Text(icon(for: workout.name))
                                            .font(.system(size: 24))
                                        Text(workout.name.isEmpty ? "Workout on \(workout.date)" : workout.name)
                                            .font(.headline)
                                    }
                                    Text(workout.date)
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                .padding(.vertical, 8)
                            }
                            .listRowBackground(Color.clear) // ✅ move it here
                        }
                        .onDelete(perform: deleteWorkout)
                    }
                }

                Section {
                    Button {
                        showAddWorkoutSheet = true
                    } label: {
                        Label("Add Workout for Today", systemImage: "plus")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(16)
                    }
                    .listRowBackground(Color.clear)
                    .sheet(isPresented: $showAddWorkoutSheet) {
                        AddWorkoutSheet(store: store, todayString: todayString, isPresented: $showAddWorkoutSheet)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Workouts")
        }
        .onAppear {
            store.loadFromBackend(userId: userId)
        }
    }

    private func deleteWorkout(at offsets: IndexSet) {
        for index in offsets {
            let workout = store.workouts[index]
            let id = workout.id
            WorkoutService.shared.removeWorkout(workoutId: id) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success:
                        print("✅ Workout deleted from backend")
                    case .failure(let error):
                        print("❌ Failed to delete workout from backend:", error.localizedDescription)
                    }

                    // Always remove locally
                    store.workouts.remove(at: index)
                }
            }
        }
    }

    private func binding(for workout: Workout) -> Binding<Workout> {
        guard let idx = store.workouts.firstIndex(where: { $0.id == workout.id }) else {
            fatalError("Workout not found")
        }
        return $store.workouts[idx]
    }

    private func icon(for name: String) -> String {
        let lower = name.lowercased()
        if lower.contains("run") || lower.contains("cardio") {
            return "🏃‍♂️"
        } else if lower.contains("push") || lower.contains("chest") {
            return "💪"
        } else if lower.contains("pull") || lower.contains("back") {
            return "🪝"
        } else if lower.contains("leg") || lower.contains("squat") {
            return "🦵"
        } else if lower.contains("core") || lower.contains("abs") {
            return "🧘"
        }
        return "📋"
    }
}

#Preview {
    HomeView()
}
