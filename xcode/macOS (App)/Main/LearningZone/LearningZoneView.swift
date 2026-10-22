//
//  LearningZoneView.swift
//  Ghostery
//
//  Learning Zone section of the main window.
//

import SwiftUI

fileprivate enum Constants {
  static let articlesHorizontalPadding: CGFloat = 20
}

fileprivate enum Strings {
  // You can translate your strings here
  static let title = String(localized: "Privacy,\nexplained simply.", comment: "Title of the Learning Zone section, in two lines")
  static let description = String(localized: "Privacy shouldn’t be complicated. Explore our guides, follow the latest privacy news, and discover how to make the web work better for you.")
}

struct LearningZoneView: View {
  var body: some View {
    SectionScrollView {
      SectionHeader(
        title: Strings.title,
        description: Strings.description,
        descriptionStyle: .bodyS,
        image: Icons.learningZoneHeader
      )
      LearningArticleList(layout: .mac)
        .padding(.horizontal, Constants.articlesHorizontalPadding)
    } footer: {
      Banner()
    }
  }
}

struct LearningZoneView_Previews: PreviewProvider {
  static var previews: some View {
    LearningZoneView()
      .frame(width: 736, height: 1058)
  }
}
