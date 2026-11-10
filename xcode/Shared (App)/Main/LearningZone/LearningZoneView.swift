//
//  LearningZoneView.swift
//  Ghostery
//
//  Learning Zone section.
//

import SwiftUI

struct LearningZoneView: View {
  var body: some View {
    SectionScrollView {
      SectionHeader(
        title: SectionStrings.LearningZone.title,
        description: SectionStrings.LearningZone.description,
        isDescriptionLong: true,
        image: .learningZoneHeader
      )
      LearningArticleList()
        .sectionContentPadding()
    } footer: {
      Banner()
    }
  }
}

#Preview {
  LearningZoneView()
    #if os(macOS)
    .frame(width: 736, height: 1058)
    #endif
}
