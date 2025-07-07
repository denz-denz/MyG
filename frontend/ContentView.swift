import SwiftUI
import GoogleSignIn
struct ContentView: View {
    @Binding var isSignedIn: Bool
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var username: String = ""
    @State private var isLoginMode: Bool = false
    @AppStorage("userId") var userId: String = ""

    let googleClientID = "674979663593-k10o1u2c7qs7fkcbog5ii9ucoiu2s0f7.apps.googleusercontent.com"
    var body: some View {
        VStack(spacing: 20) {
            Image("MyG")
                .resizable()
                .scaledToFit()
                .frame(width: 175, height: 150)
            Text(isLoginMode ? "Welcome back!" : "Ready to take that first step?")
                .font(.title2)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
            VStack(spacing: 4) {
                Text(isLoginMode ? "Log in to your account" : "Create an account")
                    .font(.subheadline)
                    .bold()
                Text(isLoginMode ? "Enter your credentials to continue" : "Enter your email to sign up for this app")
                    .font(.footnote)
                    .foregroundColor(.gray)
            }
            TextField("email@domain.com", text: $email)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            SecureField(isLoginMode ? "Password" : "Create a password", text: $password)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
            if !isLoginMode {
                TextField("Username (optional)", text: $username)
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
                    .autocapitalization(.none)
            }
            Button(action: {
                if isLoginMode {
                    sendLoginData(email: email, password: password) { returnedUserId in
                        if let id = returnedUserId {
                            DispatchQueue.main.async {
                                userId = id // ✅ this stores it globally
                                isSignedIn = true
                            }
                        }
                    }
                } else {
                    sendSignupData(email: email, password: password, username: username) { returnedUserId in
                        if let id = returnedUserId {
                            DispatchQueue.main.async {
                                userId = id // ✅ this stores it globally
                                isSignedIn = true
                            }
                        }
                    }
                }
            }) {
                Text(isLoginMode ? "Login" : "Continue")
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.black)
                    .cornerRadius(10)
            }
            HStack {
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(Color.gray.opacity(0.4))
                Text("or")
                    .foregroundColor(.gray)
                    .padding(.horizontal)
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(Color.gray.opacity(0.4))
            }
            Button(action: {
                signInWithGoogle(clientID: googleClientID) { idToken in
                    guard let idToken = idToken else {
                        print("❌ No token returned from Google Sign-In")
                        return
                    }

                    sendGoogleTokenToBackend(idToken: idToken) { returnedUserId in
                        if let id = returnedUserId {
                                        DispatchQueue.main.async {
                                            userId = id
                                            isSignedIn = true
                                        }
                                    }
                                }
                            }
                        }) {
                HStack {
                    Image("g-logo")
                        .resizable()
                        .frame(width: 18, height: 18)
                    Text("Continue with Google")
                }
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                .cornerRadius(10)
            }
            Button(action: {
                isLoginMode.toggle()
            }) {
                Text(isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in")
                    .font(.footnote)
                    .foregroundColor(.blue)
            }
            Text("By clicking continue, you agree to our Terms of Service and Privacy Policy")
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            Spacer()
        }
        .padding()
    }
}
func sendSignupData(email: String, password: String, username: String?, completion: @escaping (String?) -> Void) {
    guard let url = URL(string: "https://aed5-175-156-215-114.ngrok-free.app/auth/signup") else {
        print("Invalid signup URL")
        completion(nil)
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    var body: [String: String] = [
        "email": email,
        "password": password
    ]
    if let username = username, !username.isEmpty {
        body["username"] = username
    }

    do {
        request.httpBody = try JSONEncoder().encode(body)
    } catch {
        print("❌ Encoding error: \(error)")
        completion(nil)
        return
    }

    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Signup request failed: \(error.localizedDescription)")
            completion(nil)
            return
        }

        guard let data = data else {
            print("❌ No data in signup response")
            completion(nil)
            return
        }

        do {
            let json = try JSONDecoder().decode([String: String].self, from: data)
            if let userId = json["userId"] {
                completion(userId)
            } else {
                print("❌ userId missing in signup response")
                completion(nil)
            }
        } catch {
            print("❌ JSON decoding error: \(error)")
            completion(nil)
        }
    }.resume()
}

func sendLoginData(email: String, password: String, completion: @escaping (String?) -> Void) {
    guard let url = URL(string: "https://aed5-175-156-215-114.ngrok-free.app/auth/manual-login") else {
        print("Invalid login URL")
        completion(nil)
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body: [String: String] = [
        "email": email,
        "password": password
    ]

    do {
        request.httpBody = try JSONEncoder().encode(body)
    } catch {
        print("❌ Encoding error: \(error)")
        completion(nil)
        return
    }

    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Login request failed: \(error.localizedDescription)")
            completion(nil)
            return
        }

        guard let data = data else {
            print("❌ No data in login response")
            completion(nil)
            return
        }

        do {
            let json = try JSONDecoder().decode([String: String].self, from: data)
            if let userId = json["userId"] {
                completion(userId)
            } else {
                print("❌ userId missing in login response")
                completion(nil)
            }
        } catch {
            print("❌ JSON decoding error: \(error)")
            completion(nil)
        }
    }.resume()
}

func sendGoogleTokenToBackend(idToken: String, completion: @escaping (String?) -> Void) {
    guard let url = URL(string:
        "https://aed5-175-156-215-114.ngrok-free.app/auth/google-login") else {
        completion(nil)
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let payload = ["idToken": idToken]

    do {
        request.httpBody = try JSONEncoder().encode(payload)
    } catch {
        print("❌ Failed to encode token")
        completion(nil)
        return
    }

    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Google login request failed: \(error)")
            completion(nil)
            return
        }

        guard let data = data else {
            print("❌ No data in Google login response")
            completion(nil)
            return
        }

        do {
            let json = try JSONDecoder().decode([String: String].self, from: data)
            if let userId = json["userId"] {
                completion(userId)
            } else {
                print("❌ userId missing in Google login response")
                completion(nil)
            }
        } catch {
            print("❌ JSON decoding error: \(error)")
            completion(nil)
        }
    }.resume()
}

func signInWithGoogle(clientID: String, completion: @escaping (String?) -> Void) {
    guard let presentingVC = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first?.windows
        .first(where: { $0.isKeyWindow })?.rootViewController else {
        print("❌ No presenting VC")
        completion(nil)
        return
    }
    let config = GIDConfiguration(clientID: clientID)
    GIDSignIn.sharedInstance.configuration = config
    GIDSignIn.sharedInstance.signIn(withPresenting: presentingVC) { result, error in
        if let error = error {
            print("❌ Google Sign-In error: \(error.localizedDescription)")
            completion(nil)
            return
        }
        guard let idToken = result?.user.idToken?.tokenString else {
            print("❌ No ID token")
            completion(nil)
            return
        }
        print("✅ ID Token: \(idToken)")
        completion(idToken)
    }
}

#Preview {
    ContentView(isSignedIn: .constant(true))
}


