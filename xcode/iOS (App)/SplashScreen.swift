//
//  LaunchScreen.swift
//  Ghostery
//
//  Created by Palade Timotei on 01.06.25.
//

import SwiftUI

fileprivate enum Icons {
    static let ghosteryText = "GhosteryText"
    static let ghostery = "LargeIcon"
}

fileprivate enum Colors {
    static let lightBGColor = Color.white
    static let darkBGColor = Color.black
}

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
      Image(Icons.ghostery)
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
      withAnimation(.easeInOut(duration: 0.15), completionCriteria: .logicallyComplete) {
          scaled = true
      } completion: {
        onDoneAnimating()
      }
      iconShown = true
    }
  }
}
