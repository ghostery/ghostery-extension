//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI

fileprivate enum Icons {
    static let privacyYouCanSee = "GhosteryLogoHeader"
}

fileprivate enum Constants {
    static let noSpacing: CGFloat = .zero
    
    static let headerWidth: CGFloat = 215
    static let headerHeight: CGFloat = 32
    static let headerMaxPadding: CGFloat = 64
    static let headerMinPadding: CGFloat = 12
    static let headerVerticalPadding: CGFloat = 32
}

struct ContentView: View {
    var openInWebView: (URL) -> Void

    @State private var showSubscriptions = false
    @StateObject var storeHelper = StoreHelper()
    @State private var animating: Bool = false

    var body: some View {
      VStack(alignment: .center, spacing: Constants.noSpacing) {
          //ghosteryLogoHeader
            if showSubscriptions {
//                Subscriptions(
//                    openInWebView: openInWebView,
//                    closeSubscriptions: toggleSubscriptions
//                )
              WelcomeView(
                donateButtonPressed: {
                  toggleSubscriptions()
                }, stepByStepButtonPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/blog") else { return }
                  openInWebView(url)
                })
              .transition(AnyTransition.opacity.combined(with: .move(edge: .trailing)))
            } else {
              WelcomeView(
                donateButtonPressed: {
                  toggleSubscriptions()
                }, stepByStepButtonPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/blog") else { return }
                  openInWebView(url)
                })
              .transition(AnyTransition.opacity.combined(with: .move(edge: .leading)))
            }
        }.environmentObject(storeHelper)
    }
  
    var ghosteryLogoHeader: some View {
        Image(Icons.privacyYouCanSee)
            .resizable()
            .scaledToFit()
            .frame(width: Constants.headerWidth)
            .frame(minHeight: Constants.headerHeight + Constants.headerMinPadding,
                   maxHeight: Constants.headerHeight + Constants.headerMaxPadding)
    }

    func toggleSubscriptions() {
      guard animating == false else { return }
      animating = true
      withAnimation(.easeInOut(duration: 0.3),
                    completionCriteria: .removed,
                    { self.showSubscriptions.toggle() },
                    completion: { animating = false })
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(openInWebView: {_ in })
    }
}
