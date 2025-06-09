//
//  Common.swift
//  Ghostery
//
//  Created by Palade Timotei on 03.06.25.
//

import SwiftUI

enum Theme {
    case light
    case dark
}

enum Fonts {
    // Change with Inter font here
    static let footnote: Font = .system(size: 12, weight: .regular)
    static let text: Font = .system(size: 12, weight: .bold)
    static let description: Font = .system(size: 14, weight: .regular)
    static let buttonTitle: Font = .system(size: 14, weight: .bold)
    static let headline: Font = .system(size: 18, weight: .bold)
    static let subheadline: Font = .system(size: 16, weight: .bold)
    static let title: Font = .system(size: 16, weight: .regular)
}

enum Colors {
    static let lightBGColor = Color.white
    static let darkBGColor = Color.black
    static let lightTextColor = Color.black
    static let darkTextColor = Color.white
    static let shadowColor = Color.black.opacity(0.15)
    static let buttonBGColor = Color.white
    static let ghosteryBlue = Color(hex: "#0077CC")
    static let lightBlue = Color(hex: "#A1E4FF")
    static let purple = Color(hex: "#3751D4")
    static let textGray = Color(hex: "#3F4146")
    static let dividerGray = Color(hex: "#E0E2E5")
    static let foregroundPrimary = Color(hex: "#202225")
    static let bgBrandPrimary = Color(hex: "#EBF7FD")
    static let foregroundBrandPrimary = Color(hex: "#0077CC")
}

enum Icons {
    static let privacyYouCanSee = "GhosteryLogoHeader"
    static let safari = "Safari"
    static let warning = "Warning"
    static let siteSettings = "SiteSettings"
    static let plugins = "Plugins"
    static let ghosterySmall = "GhosterySmallLogo"
    static let tap = "Tap"
    static let ghosteryText = "GhosteryText"
    static let ghosteryLarge = "LargeIcon"
    static let contributeIllustration = "ContributeIllustration"
}
