//
//  LearningZoneView.swift
//  Ghostery
//
//  Learning Zone section.
//

import SwiftUI

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Privacy, explained simply.", comment: "Title of the Learning Zone section, in one line")
  static let description = String(localized: "Privacy shouldn’t be complicated. Explore our guides, follow the latest privacy news, and discover how to make the web work better for you.")
}

struct LearningZoneView: View {
  var body: some View {
    SectionScrollView { layout in
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        // Smaller on iPhones, and across the screen
        descriptionStyle: layout.isTablet ? nil : .bodyM,
        descriptionWidth: layout.isTablet ? nil : .infinity,
        layout: layout
      )

      LearningArticleList(layout: layout.isTablet ? .tablet : .phone)

      Banner()
        .padding(.top, layout.bannerTopPadding)
    }
  }
}

struct LearningZoneView_Previews: PreviewProvider {
  static var previews: some View {
    LearningZoneView()
  }
}
