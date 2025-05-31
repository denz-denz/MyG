import SwiftUI

struct ContentView: View {
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var username: String = ""
    let googleClientID = "266407106880-eer110745r05osd92jb935b6m53lo2ah.apps.googleusercontent.com"

    var body: some View {
        VStack(spacing: 20) {
            // Logo (Make sure "MyG" is in Assets.xcassets)
            Image("MyG")
                .resizable()
                .scaledToFit()
                .frame(width: 175, height: 150)
            
            // Titlei ju
            Text("Ready to take that first step?")
                .font(.title2)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)

            // Subtitle
            VStack(spacing: 4) {
                Text("Create an account")
                    .font(.subheadline)
                    .bold()
                Text("Enter your email to sign up for this app")
                    .font(.footnote)
                    .foregroundColor(.gray)
            }

            // Email TextField
            TextField("email@domain.com", text: $email)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            
            // Password
            SecureField("Create a password", text: $password)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
            
            //username
            TextField("Username (optional)", text: $username)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
                .autocapitalization(.none)

            // Continue Button
            Button(action: {
                sendSignupData(email: email, password: password, username: username)
            }) {
                Text("Continue")
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.black)
                    .cornerRadius(10)
            }

            // Divider with "or"
            HStack {
                Rectangle()
                    .frame(height:1)
                    .foregroundColor(Color.gray.opacity(0.4))
                
                Text("or")
                    .foregroundColor(.gray)
                    .padding(.horizontal)
                
                Rectangle()
                    .frame(height:1)
                    .foregroundColor(Color.gray.opacity(0.4))
            }

            // Google Sign-In Button (Mock)
            Button(action: {
                signInWithGoogle(clientID: googleClientID) { idToken in
                    guard let idToken = idToken else {
                        print("❌ No token returned from Google Sign-In")
                        return
                    }
                
                    sendGoogleTokenToBackend(idToken: idToken)
                }
            }) {
                HStack {
                    Image("g-logo")
                        .resizable()
                        .frame(width:18, height:18)
                    Text("Continue with Google")
                }
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.5)))
                .cornerRadius(10)
            }
/
            // Apple Sign-In Button
            Button(action: {
                // handle Apple sign-in
            }) {
                HStack {
                    Image(systemName: "applelogo")
                    Text("Continue with Apple")
                }
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.gray)
                .cornerRadius(10)
            }
            /
             
            // Terms of Service & Privacy
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

func sendSignupData(email: String, password: String, username: String?) {
    guard let url = URL(string: "https://5746-175-156-216-56.ngrok-free.app/auth/signup") else {
        print("Invalid URL")
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    // Construct the body
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
        print("Error encoding body: \(error)")
        return
    }

    // Send request
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Request failed: \(error.localizedDescription)")
            return
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ Invalid response")
            return
        }

        print("✅ Status code: \(httpResponse.statusCode)")

        if let data = data {
            if let responseBody = String(data: data, encoding: .utf8) {
                print("✅ Response body: \(responseBody)")
            }
        }
    }.resume()
}

func sendGoogleTokenToBackend(idToken: String) {
    guard let url = URL(string: "https://5746-175-156-216-56.ngrok-free.app/auth/google-login/auth/google-login") else { return }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let payload = ["id_token": idToken]

    do {
        request.httpBody = try JSONEncoder().encode(payload)
    } catch {
        print("❌ Failed to encode token")
        return
    }

    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Backend error: \(error)")
            return
        }

        if let data = data {
            print("✅ Response: \(String(data: data, encoding: .utf8) ?? "")")
        }
    }.resume()
}

import GoogleSignIn

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
    ContentView()
}
