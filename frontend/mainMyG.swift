import GoogleSignIn
import SwiftUI
@main

struct MyGApp: App {
  @State private var isSignedIn = true
    
  var body: some Scene {
    WindowGroup {
      if isSignedIn {
        RootView(isSignedIn: $isSignedIn)
      } else {
          ContentView(isSignedIn: $isSignedIn)
              .onOpenURL { url in
                  GIDSignIn.sharedInstance.handle(url)
        }
      }
    }
  }
}


