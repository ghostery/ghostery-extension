//
//  IntroView.swift
//  Ghostery
//
//  Created by Palade Timotei on 29.06.25.
//

import SwiftUI

struct IntroView: View {
  
  @State private var theme = Theme.light

  @State private var showBackground = false
  @State private var showContentView = false
  @State private var animateContentView = false
  @State private var scaleContentView = false
  
  var openInWebView: (URL) -> Void

  var body: some View {
      ZStack(alignment: .center) {
        GhosteryGradientBackground()
          .opacity(showBackground ? 1 : 0)
          .animation(.easeInOut(duration: 0.3), value: showBackground)
          .scrollContentBackground(.hidden)
        if showContentView {
          ContentView(openInWebView: openInWebView)
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
      .preferredColorScheme(theme == .light ? .light : .dark)
  }
}
