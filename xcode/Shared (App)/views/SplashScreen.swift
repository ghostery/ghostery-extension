//
//  LaunchScreen.swift
//  Ghostery
//
//  Created by Palade Timotei on 01.06.25.
//

import SwiftUI

fileprivate enum Constants {
  static let ghosteryTextWidth: CGFloat = 131
  static let ghosteryTextHeight: CGFloat = 29
  static let noSpacing: CGFloat = .zero
  static let iconWidth: CGFloat = 126
  static let iconHeight: CGFloat = 144
  static let iconPaddingBottom: CGFloat = 4
}

struct SplashScreen: View {
  
  var onDoneAnimating: () -> Void
  @State var theme = Theme.light
  @State private var iconShown = false
  @State private var scaled = false
  
  var body: some View {
    VStack(alignment: .center, spacing: Constants.noSpacing) {
      Spacer()
      Image(Icons.ghosteryLarge)
        .resizable()
        .scaledToFit()
        .frame(width: Constants.iconWidth, height: Constants.iconHeight)
        .opacity(iconShown ? 1 : 0)
        .animation(.easeInOut(duration: 0.4), value: iconShown)
        .scaleEffect(scaled ? 1 : 0.2)
        .padding(.bottom, Constants.iconPaddingBottom)
      Image(Icons.ghosteryText)
        .resizable()
        .scaledToFit()
        .frame(width: Constants.ghosteryTextWidth, height: Constants.ghosteryTextHeight)
      Spacer()
    }
    .onAppear {
      if #available(macOS 14.0, *) {
        withAnimation(.easeInOut(duration: 0.25), completionCriteria: .logicallyComplete) {
          scaled = true
        } completion: {
          onDoneAnimating()
        }
      } else {
        // Fallback on earlier versions
        withAnimation {
          scaled = true
          Task {
            // wait 150 ms
            try? await Task.sleep(nanoseconds: 250_000_000)
            onDoneAnimating()
          }
        }
      }
      iconShown = true
    }
  }
}
