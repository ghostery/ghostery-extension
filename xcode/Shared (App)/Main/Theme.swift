//
//  Theme.swift
//  Ghostery
//
//  Colors and images of the app, shared by its macOS and iOS versions.
//

import SwiftUI

extension Color {
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int = UInt64()
    Scanner(string: hex).scanHexInt64(&int)

    let a, r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
      (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
      (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8: // ARGB (32-bit)
      (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
      (a, r, g, b) = (255, 0, 0, 0)
    }

    self.init(
      .sRGB,
      red: Double(r) / 255,
      green: Double(g) / 255,
      blue: Double(b) / 255,
      opacity: Double(a) / 255
    )
  }
}

// Named as in the extension's styles
enum Colors {
  static let foregroundPrimary = Color(hex: "#202225")
  static let foregroundSecondary = Color(hex: "#3F4146")
  static let foregroundTertiary = Color(hex: "#636568")
  static let foregroundQuaternary = Color(hex: "#88898C")
  static let foregroundBrandPrimary = Color(hex: "#0077CC")
  static let foregroundOnBrand = Color.white
  static let bgPrimary = Color.white
  static let bgSecondary = Color(hex: "#F2F4F7")
  static let bgTertiary = Color(hex: "#E0E2E5")
  static let bgBrandPrimary = Color(hex: "#EBF7FD")
  static let bgBrandSecondary = Color(hex: "#DAF3FF")
  static let bgBrandSolid = Color(hex: "#00AEF0")
  static let borderPrimary = Color(hex: "#E0E2E5")
  static let borderSecondary = Color(hex: "#B9BBBE")
  static let borderTertiary = Color(hex: "#88898C")
  static let borderBrandSolid = Color(hex: "#0077CC")
  // Brand palette
  static let brand300 = Color(hex: "#9ADEFF")
  // Success palette
  static let bgSuccessPrimary = Color(hex: "#EDFCED")
  static let bgSuccessSecondary = Color(hex: "#ABF0AA")
  static let foregroundSuccessPrimary = Color(hex: "#0A7408")
  // Warning palette
  static let bgWarningPrimary = Color(hex: "#FFF2D9")
  static let borderWarningPrimary = Color(hex: "#FEDF89")
  static let borderWarningSolid = Color(hex: "#DC6803")
  static let foregroundWarningPrimary = Color(hex: "#B54708")
  static let warning600 = Color(hex: "#DC6803")
  static let shadowButton = Color.black.opacity(0.06)
  static let shadowCard = Color.black.opacity(0.06)
  static let shadowPanel = Color.black.opacity(0.2)
  static let shadowSmall = Color(hex: "#0A0D12").opacity(0.1)
}

extension RadialGradient {
  /// Background of the round button opening the Support dialog, in the blue
  /// of Ghostery getting darker away from its top leading part
  static func support(size: CGFloat) -> RadialGradient {
    RadialGradient(
      stops: [
        .init(color: Color(hex: "#00AEF0"), location: 0),
        .init(color: Color(hex: "#068DCF"), location: 0.25),
        .init(color: Color(hex: "#0D6BAF"), location: 0.5),
        .init(color: Color(hex: "#134A8E"), location: 0.75),
        .init(color: Color(hex: "#19296E"), location: 1),
      ],
      center: UnitPoint(x: 0.175, y: 0.15),
      startRadius: 0,
      endRadius: 0.9675 * size
    )
  }
}

enum Icons {
  static let homeLogo = "HomeLogo"
  static let homeHeaderProtection = "HomeHeaderProtection"
  static let homeAppStore = "HomeAppStore"
  static let homeChevronRight = "HomeChevronRight"
  static let homeMore = "HomeMore"
  static let homeMoreHover = "HomeMoreHover"
  static let homeBack = "HomeBack"
  static let homeCheck = "HomeCheck"
  static let homeChevronDown = "HomeChevronDown"
  static let homeChevronUp = "HomeChevronUp"
  static let homeWarning = "HomeWarning"
  static let menuBarIcon = "MenuBarIcon"
  static let bannerLaunch = "BannerLaunch"
  static let safariInstructionsHeader = "SafariInstructionsHeader"
  static let safariInstructionsCheck = "SafariInstructionsCheck"
  static let safariInstructionsReturn = "SafariInstructionsReturn"
  static let safariOnboarding = "SafariOnboarding"
  static let safariOnboardingEnabled = "SafariOnboardingEnabled"
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
  static let contributionSubscribed = "ContributionSubscribed"
  static let shareHeader = "ShareHeader"
  static let shareFacebook = "ShareFacebook"
  static let shareX = "ShareX"
  static let shareLinkedin = "ShareLinkedin"
  static let shareCopy = "ShareCopy"
  static let shareCopied = "ShareCopied"
  static let shareMail = "ShareMail"
  static let shareSystem = "ShareSystem"
  static let settingsHeader = "SettingsHeader"
  static let supportHeader = "SupportHeader"
  static let supportTracker = "SupportTracker"
  static let supportFeedback = "SupportFeedback"
  static let supportContact = "SupportContact"
  static let bannerReview = "BannerReview"
  static let bannerHelp = "BannerHelp"
  static let bannerChevronRight = "BannerChevronRight"
  static let dialogClose = "DialogClose"
  static let qrCodeLogo = "QRCodeLogo"
}
