//
//  SafariInstructionsView.swift
//  Ghostery
//
//  Steps to enable the extension in Safari, opened from the Home section.
//

import SwiftUI

/// Sizes of the page, which are larger on iPads
fileprivate struct SafariInstructionsLayout: PlatformLayout {
  /// Between the header of the steps and them
  var stepsSpacing: CGFloat
  var steps: SafariStepLayout

  static let phone = SafariInstructionsLayout(stepsSpacing: 8, steps: .phone)
  static let tablet = SafariInstructionsLayout(stepsSpacing: 24, steps: .tablet)
}

struct SafariInstructionsView: View {
  var onBack: () -> Void

  @CurrentLayout private var layout: SafariInstructionsLayout

  var body: some View {
    SectionScrollView {
      SectionHeader(title: SectionStrings.SafariInstructions.title, onBack: onBack)

      Text(SectionStrings.SafariInstructions.stepsHeader)
        .textStyle(.labelL)
        .foregroundColor(Colors.foregroundPrimary)
        .accessibilityAddTraits(.isHeader)
        .padding(.bottom, layout.stepsSpacing)

      SafariEnableSteps(layout: layout.steps)
    }
  }
}

#Preview {
  SafariInstructionsView(onBack: {})
}
