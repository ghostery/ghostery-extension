//
//  MainView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI
import WebKit
import SafariServices
import UIKit

extension WelcomeWebView: UIViewRepresentable {

    func makeUIView(context: UIViewRepresentableContext<WelcomeWebView>) -> WKWebView {
        //        webView.navigationDelegate = context.coordinator
        //        webView.uiDelegate = context.coordinator
        load()
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: UIViewRepresentableContext<WelcomeWebView>) {

    }
}


struct SafariView: UIViewControllerRepresentable {
    @Binding var url: URL!

    func makeUIViewController(context: UIViewControllerRepresentableContext<SafariView>) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController,
                                context: UIViewControllerRepresentableContext<SafariView>) {

    }
}

@main
struct GhosteryApp: App {

    @State private var theme = Theme.light
    @State private var showSheet = false
    @State private var url = URL(string: "")

    @State private var showBackground = false
    @State private var showContentView = false
    @State private var animateContentView = false
    @State private var scaleContentView = false

    var body: some Scene {
      WindowGroup {
        ZStack(alignment: .center) {
          GhosteryGradientBackground()
            .opacity(showBackground ? 1 : 0)
            .animation(.easeInOut(duration: 0.3), value: showBackground)
            .scrollContentBackground(.hidden)
          if showContentView {
            ContentView(openInWebView: openInWebView)
              .preferredColorScheme(.dark)
              .sheet(isPresented: $showSheet) {
                SafariView(url: $url)
              }
              .opacity(animateContentView ? 1 : 0)
              .animation(.easeInOut(duration: 0.2), value: animateContentView)
              .scaleEffect(scaleContentView ? 1 : 0.2)
              .animation(.easeInOut(duration: 0.15), value: scaleContentView)
              .onAppear {
                showBackground = true
                animateContentView = true
                scaleContentView = true
              }
          } else {
            SplashScreen(onDoneAnimating: {
              Task {
                try? await Task.sleep(nanoseconds: 500_000_000)
                showContentView = true
              }
            })
          }
        }
        .background(theme == .light ? Colors.lightBGColor : Colors.darkBGColor)
      }
    }

    func openInWebView(url: URL) {
        self.url = url
        self.showSheet = true
    }
}
