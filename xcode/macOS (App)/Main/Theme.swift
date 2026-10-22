//
//  Theme.swift
//  Ghostery
//
//  Colors and images of the main window, which only the macOS app uses.
//

import SwiftUI

extension Colors {
  static let foregroundQuaternary = Color(hex: "#88898C")
  // Brand palette, as in the extension's styles
  static let brand300 = Color(hex: "#9ADEFF")
  static let bgPrimary = Color.white
  static let bgSecondary = Color(hex: "#F2F4F7")
  static let bgTertiary = Color(hex: "#E0E2E5")
  static let borderPrimary = Color(hex: "#E0E2E5")
  static let borderSecondary = Color(hex: "#B9BBBE")
  static let borderTertiary = Color(hex: "#88898C")
  static let borderBrandSolid = Color(hex: "#0077CC")
  static let bgSuccessPrimary = Color(hex: "#EDFCED")
  static let bgSuccessSecondary = Color(hex: "#ABF0AA")
  static let foregroundSuccessPrimary = Color(hex: "#0A7408")
  // Warning palette, as in the extension's styles
  static let bgWarningPrimary = Color(hex: "#FFF2D9")
  static let borderWarningPrimary = Color(hex: "#FEDF89")
  static let borderWarningSolid = Color(hex: "#DC6803")
  static let foregroundWarningPrimary = Color(hex: "#B54708")
  static let warning600 = Color(hex: "#DC6803")
  static let foregroundOnBrand = Color.white
  static let shadowButton = Color.black.opacity(0.06)
  static let shadowCard = Color.black.opacity(0.06)
  static let shadowPanel = Color.black.opacity(0.2)
  static let shadowSmall = Color(hex: "#0A0D12").opacity(0.1)
}

extension Icons {
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
  static let settingsHeader = "SettingsHeader"
  static let supportHeader = "SupportHeader"
  static let supportTracker = "SupportTracker"
  static let supportFeedback = "SupportFeedback"
  static let supportContact = "SupportContact"
  static let bannerReview = "BannerReview"
  static let bannerHelp = "BannerHelp"
  static let bannerChevronRight = "BannerChevronRight"
  static let dialogClose = "DialogClose"
  static let qrCode = "QRCode"
  static let qrCodeSmall = "QRCodeSmall"
}
