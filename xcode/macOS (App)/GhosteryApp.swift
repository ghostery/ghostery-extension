//
//  AppDelegate.swift
//  macOS (App)
//
//  Created by Krzysztof Jan Modras on 27.09.21.
//

import Cocoa
import SwiftUI
import WebKit

extension WelcomeWebView: NSViewRepresentable {
    public typealias NSViewType = WKWebView

    func makeNSView(context: NSViewRepresentableContext<WelcomeWebView>) -> WKWebView {
        //        webView.navigationDelegate = context.coordinator
        //        webView.uiDelegate = context.coordinator
        load()
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: NSViewRepresentableContext<WelcomeWebView>) {
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Insert code here to initialize your application
        NSWindow.allowsAutomaticWindowTabbing = false
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

@main
struct GhosteryApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self)
    var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView(openInWebView: openInWebView)
                .frame(width: 400, height: 720)
                .onReceive(NotificationCenter.default.publisher(for: NSApplication.willUpdateNotification), perform: { _ in
                    for window in NSApplication.shared.windows {
                        window.standardWindowButton(.zoomButton)?.isEnabled = false
                    }
                })
        }
    }

    func openInWebView(url: URL) {
        NSWorkspace.shared.open(url)
    }
}
