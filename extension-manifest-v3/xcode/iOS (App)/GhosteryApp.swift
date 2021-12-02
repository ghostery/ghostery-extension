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

    @State private var showSheet = false
    @State private var url = URL(string: "")

    var body: some Scene {
        WindowGroup {
            ContentView(openInWebView: openInWebView)
                    .preferredColorScheme(.dark)
                    .sheet(isPresented: $showSheet) {
                            SafariView(url: $url)
                    }
        }
    }

    func openInWebView(url: URL) {
        self.url = url
        self.showSheet = true
    }
}
