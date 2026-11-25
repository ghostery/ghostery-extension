//
//  SafariInstructionsView.swift
//  Ghostery
//
//  Steps to enable the extension in Safari, opened from the Home section.
//

import SwiftUI

struct SafariInstructionsView: View {
  // Of the steps, which are larger on iPads
  @CurrentLayout private var layout: SafariStepLayout

  var body: some View {
    SectionScrollView {
      SectionHeader(title: SectionStrings.SafariInstructions.title)

      SafariEnableSteps(layout: layout)
    }
  }
}

#Preview {
  SafariInstructionsView()
}
