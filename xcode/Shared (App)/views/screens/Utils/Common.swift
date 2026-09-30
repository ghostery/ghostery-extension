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
    static let buttonFootnote: Font = .system(size: 11, weight: .bold)
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
    static let labelsTertiary = Color(hex: "#3C3C434D")
    static let foregroungTertiary = Color(hex: "#636568")
    static let foregroundSecondary = Color(hex: "#3F4146")
    static let foregroundQuaternary = Color(hex: "#88898C")
    static let bgBrandSolid = Color(hex: "#00AEF0")
    static let bgBrandSecondary = Color(hex: "#DAF3FF")
    static let bgPrimary = Color.white
    static let bgSecondary = Color(hex: "#F2F4F7")
    static let bgTertiary = Color(hex: "#E0E2E5")
    static let borderPrimary = Color(hex: "#E0E2E5")
    static let borderSecondary = Color(hex: "#B9BBBE")
    static let borderBrandSolid = Color(hex: "#0077CC")
    static let foregroundOnBrand = Color.white
    static let shadowButton = Color.black.opacity(0.06)
    static let shadowCard = Color.black.opacity(0.06)
    static let shadowPanel = Color.black.opacity(0.2)
    static let shadowSmall = Color(hex: "#0A0D12").opacity(0.1)
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
    static let attention = "Attention"
    static let ghosterySmallGray = "GhosterySmallLogoGray"
    static let click = "Click"
    static let checkmark = "Checkmark"

    static let homeLogo = "HomeLogo"
    static let homeHeaderProtection = "HomeHeaderProtection"
    static let homeQRSmall = "HomeQRSmall"
    static let homeAppStore = "HomeAppStore"
    static let homeChevronRight = "HomeChevronRight"
    static let homeNavHome = "HomeNavHome"
    static let homeNavLearn = "HomeNavLearn"
    static let homeNavContribute = "HomeNavContribute"
    static let homeNavSettings = "HomeNavSettings"
    static let homeNavSupport = "HomeNavSupport"
    static let browserSafari = "BrowserSafari"
    static let browserFirefox = "BrowserFirefox"
    static let browserChrome = "BrowserChrome"
    static let browserEdge = "BrowserEdge"
    static let learningZoneHeader = "LearningZoneHeader"
    static let learningZoneNewsletter = "LearningZoneNewsletter"
    static let arrowRight = "ArrowRightSmall"
    static let contributeHeader = "ContributeHeader"
    static let contributionDonate = "ContributionDonate"
    static let contributionShop = "ContributionShop"
    static let contributionShare = "ContributionShare"
    static let settingsHeader = "SettingsHeader"
    static let supportHeader = "SupportHeader"
    static let supportClose = "SupportClose"
    static let supportTracker = "SupportTracker"
    static let supportFeedback = "SupportFeedback"
    static let supportContact = "SupportContact"
}
