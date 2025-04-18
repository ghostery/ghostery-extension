//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI

struct ContentView: View {
    var openInWebView: (URL) -> Void

    @State private var showSubscriptions = false
    @StateObject var storeHelper = StoreHelper()

    var body: some View {
        VStack {
            if !showSubscriptions {
              WelcomeView(
                donateButtonPressed: {
                  toggleSubscriptions()
                }, stepByStepButtonPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/blog/how-to-install-extensions-in-safari#how-to-install-the-ghostery-ad-blocker-extension-on-your-iphone") else { return }
                  openInWebView(url)
                })
            }
            if showSubscriptions {
                Subscriptions(
                    openInWebView: openInWebView,
                    closeSubscriptions: toggleSubscriptions
                )
            }
        }.environmentObject(storeHelper)
    }

    func toggleSubscriptions() {
        self.showSubscriptions.toggle()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(openInWebView: {_ in })
    }
}
