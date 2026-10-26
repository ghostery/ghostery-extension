//
//  BecomeContributorView.swift
//  Ghostery
//
//  Contribute section, with the donation page.
//

import SwiftUI

/// Sizes of the section, which differ between the Mac, iPhones and iPads
fileprivate struct ContributeLayout: PlatformLayout {
  /// Whether the description of the section is one of the longer ones
  var isDescriptionLong: Bool
  var subtitleAlignment: TextAlignment
  var subtitlePadding: EdgeInsets

  #if os(macOS)
  static let mac = ContributeLayout(
    isDescriptionLong: false,
    subtitleAlignment: .center,
    subtitlePadding: EdgeInsets(top: 0, leading: 24, bottom: 12, trailing: 20)
  )
  #else
  static let phone = ContributeLayout(
    isDescriptionLong: true,
    subtitleAlignment: .leading,
    subtitlePadding: EdgeInsets(top: 0, leading: 0, bottom: 16, trailing: 0)
  )
  static let tablet = phone
  #endif
}

struct BecomeContributorView: View {
  @State private var showsDonation = DebugLaunch.opens(.donation)
  @CurrentLayout private var layout: ContributeLayout

  var body: some View {
    if showsDonation {
      DonationView(onBack: { showsDonation = false })
    } else {
      contributions
    }
  }

  private var contributions: some View {
    SectionScrollView {
      SectionHeader(
        title: SectionStrings.Contribute.title,
        description: SectionStrings.Contribute.description,
        isDescriptionLong: layout.isDescriptionLong,
        image: .contributeHeader
      )
      Text(SectionStrings.Contribute.subtitle)
        .textStyle(.labelM)
        .foregroundColor(Colors.foregroundPrimary)
        .multilineTextAlignment(layout.subtitleAlignment)
        .fixedSize(horizontal: false, vertical: true)
        .frame(maxWidth: .infinity, alignment: layout.subtitleAlignment == .center ? .center : .leading)
        .padding(layout.subtitlePadding)
      ContributionList(onDonate: { showsDonation = true })
        .sectionContentPadding()
    } footer: {
      Banner()
    }
  }
}

#Preview {
  BecomeContributorView()
    #if os(macOS)
    .frame(width: 736, height: 752)
    #endif
}
