//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI


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
          Spacer()
          ghosteryLogoHeader
            if !showSubscriptions {
              WelcomeView(
                donateButtonPressed: {
                  toggleSubscriptions()
                }, stepByStepButtonPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/blog") else { return }
                  openInWebView(url)
                })
              .transition(AnyTransition.opacity.combined(with: .move(edge: .leading)))
            } else {
              ContributeView(
                donateButtonPressed: {
                  toggleSubscriptions()
                },
                stepByStepButtonPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/blog") else { return }
                  openInWebView(url)
                },
                eulaPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/privacy/ghostery-subscription-plans-and-products-end-user-license-agreement") else { return }
                  openInWebView(url)
                },
                termsPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/privacy/ghostery-terms-and-conditions") else { return }
                  openInWebView(url)
                },
                policyPressed: {
                  guard let url = URL(string: "https://www.ghostery.com/privacy-policy") else { return }
                  openInWebView(url)
                },
                backPressed: {
                  withAnimation {
                      if showSubscriptions {
                          showSubscriptions = false
                      }
                  }
                })
              .transition(AnyTransition.opacity.combined(with: .move(edge: .trailing)))
            }
          Spacer()
        }
        .environmentObject(storeHelper)
        .gesture(
            SwipeRecognizer(direction: .right) { _ in
                withAnimation {
                    if showSubscriptions {
                        showSubscriptions = false
                    }
                }
            }
        )
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

struct SwipeRecognizer: UIGestureRecognizerRepresentable {
    typealias Action = (UISwipeGestureRecognizer.Direction) -> Void
    
    let direction: UISwipeGestureRecognizer.Direction
    let action: Action
    
    func makeUIGestureRecognizer(context: Context) -> UISwipeGestureRecognizer {
        let recognizer = UISwipeGestureRecognizer(
            target: context.coordinator,
            action: #selector(Coordinator.handle(_:))
        )
        recognizer.direction = direction
        return recognizer
    }
    
    func updateGestureRecognizer(_ recognizer: UISwipeGestureRecognizer,
                                 context: Context) { }
    
    func makeCoordinator(converter: CoordinateSpaceConverter) -> Coordinator { Coordinator(action: action) }
    
    final class Coordinator: NSObject {
        let action: Action
        init(action: @escaping Action) { self.action = action }
        @objc func handle(_ recognizer: UISwipeGestureRecognizer) {
            action(recognizer.direction)              // fire once per swipe
        }
    }
}
