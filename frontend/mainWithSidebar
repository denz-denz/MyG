import SwiftUI

enum SidebarItem: String, CaseIterable, Identifiable {
    case progress = "Progress Tracker"
    case macro    = "Macro-Friendly Near Me"

    var id: String { rawValue }
    var systemImage: String {
        switch self {
        case .progress: return "chart.bar.doc.horizontal"
        case .macro:    return "map"
        }
    }
}

struct RootView: View {
    @Binding var isSignedIn: Bool
    @State private var selection: SidebarItem? = .progress

    var body: some View {
        NavigationSplitView {
            // — Sidebar —
            List(selection: $selection) {
                // Log Out button at the top
                Button(role: .destructive) {
                    isSignedIn = false
                    print(isSignedIn)
                } label: {
                    Label("Log Out", systemImage: "arrow.backward.square")
                }

                // Feature links
                Section("Features") {
                    ForEach(SidebarItem.allCases) { item in
                        NavigationLink(value: item) {
                            Label(item.rawValue, systemImage: item.systemImage)
                        }
                    }
                }
            }
            .listStyle(.sidebar)
            .navigationTitle("Menu")
        } detail: {
            // — Detail pane —
            Group {
                switch selection {
                case .macro:
                    MacroFriendlyMapView()
                default:
                    HomeView()
                }
            }
        }
    }
}

#if DEBUG
struct RootView_Previews: PreviewProvider {
    static var previews: some View {
        RootView(isSignedIn: .constant(true))
            .previewDisplayName("Signed In")
    }
}
#endif
